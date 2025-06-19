/**
 * Market Research API Route
 * 
 * This route handles market research operations for a specific company:
 * 
 * POST: Initiates a new market research analysis
 * - Verifies user authentication and company ownership
 * - Checks for existing in-progress research
 * - Creates new research record and starts background analysis process
 * - Analysis includes: web search, financial data, competitor analysis, and AI insights
 * 
 * GET: Retrieves the latest market research for a company
 * - Verifies user authentication and company ownership
 * - Returns the most recent market research record
 * 
 * PATCH: Updates specific fields of the market research data
 * - Verifies user authentication and company ownership
 * - Updates the market research record with the provided data
 * 
 * The background analysis process:
 * 1. Web search using Tavily API
 * 2. Financial data from Alpha Vantage API (for public companies)
 * 3. Competitor analysis using Tavily API
 * 4. AI analysis using Claude to generate insights
 * 5. Updates progress throughout the process
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { Anthropic } from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import axios from 'axios'

const prisma = new PrismaClient()

// Ensure prisma connection is properly typed
async function getPrismaClient() {
  return prisma
}

// Initialize AI clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Alpha Vantage API
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

// Tavily API
const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const TAVILY_BASE_URL = 'https://api.tavily.com/search'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params

    // Verify the company belongs to the user
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Check if there's already a research in progress
    const existingResearch = await prisma.marketResearch.findFirst({
      where: {
        companyId,
        status: 'IN_PROGRESS'
      }
    })

    if (existingResearch) {
      return NextResponse.json({ 
        error: 'Market research already in progress',
        researchId: existingResearch.id 
      }, { status: 409 })
    }

    // Create new market research record with initial progress log
    const marketResearch = await prisma.marketResearch.create({
      data: {
        companyId,
        status: 'IN_PROGRESS',
        aiAnalysis: JSON.stringify({
          progress: [
            {
              step: 'Initializing',
              status: 'completed',
              message: `Starting comprehensive market research for ${company.name}`,
              timestamp: new Date().toISOString(),
              details: {
                company: company.name,
                website: company.website,
                searchScope: 'Market analysis, competitors, financial data, industry trends'
              }
            }
          ]
        })
      }
    })

    // Start the research process in background
    performMarketResearch(marketResearch.id, company.name, company.website || undefined)

    return NextResponse.json({ 
      message: 'Market research started',
      researchId: marketResearch.id,
      status: 'IN_PROGRESS'
    })

  } catch (error) {
    console.error('Error starting market research:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params

    // Verify the company belongs to the user
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get the latest market research
    const marketResearch = await prisma.marketResearch.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    if (!marketResearch) {
      return NextResponse.json({ error: 'No market research found' }, { status: 404 })
    }

    return NextResponse.json(marketResearch)

  } catch (error) {
    console.error('Error fetching market research:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params
    const updates = await request.json()

    // Verify the company belongs to the user
    const company = await prisma.company.findFirst({
      where: {
        id: companyId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get the latest market research
    const existingResearch = await prisma.marketResearch.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    if (!existingResearch) {
      return NextResponse.json({ error: 'No market research found' }, { status: 404 })
    }

    // Validate and prepare the update data
    const allowedFields = [
      'executiveSummary',
      'marketPosition', 
      'competitors',
      'opportunities',
      'threats',
      'recommendations'
    ]

    const updateData: any = {
      lastUpdated: new Date()
    }

    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field)) {
        updateData[field] = value
      }
    }

    if (Object.keys(updateData).length <= 1) { // Only lastUpdated
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Update the market research record
    const updatedResearch = await prisma.marketResearch.update({
      where: { id: existingResearch.id },
      data: updateData
    })

    return NextResponse.json(updatedResearch)

  } catch (error) {
    console.error('Error updating market research:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function updateProgress(researchId: string, step: string, status: 'in_progress' | 'completed' | 'failed', message: string, details?: any) {
  try {
    // Get current research
    const research = await prisma.marketResearch.findUnique({
      where: { id: researchId }
    })
    
    if (!research) return

    // Parse existing progress or initialize
    let progressData
    try {
      progressData = research.aiAnalysis ? JSON.parse(research.aiAnalysis as string) : { progress: [] }
    } catch {
      progressData = { progress: [] }
    }

    if (!progressData.progress) {
      progressData.progress = []
    }

    // Add new progress entry
    progressData.progress.push({
      step,
      status,
      message,
      timestamp: new Date().toISOString(),
      details
    })

    // Update the record
    await prisma.marketResearch.update({
      where: { id: researchId },
      data: {
        aiAnalysis: JSON.stringify(progressData),
        lastUpdated: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating progress:', error)
  }
}

async function performMarketResearch(researchId: string, companyName: string, companyWebsite?: string) {
  try {
    console.log(`Starting market research for: ${companyName}`)

    await updateProgress(researchId, 'Web Search', 'in_progress', 'Searching the web for market information, news, and industry trends', {
      searchTerms: ['market analysis', 'industry trends', 'competitors', 'revenue', 'funding'],
      sources: 'News articles, company websites, industry reports',
      thinking: 'Crafting targeted search query to gather comprehensive market intelligence'
    })

    // Step 1: Search for company information using Tavily
    const searchQuery = `${companyName} market analysis industry trends competitors revenue funding ${companyWebsite ? `site:${companyWebsite}` : ''}`
    
    await updateProgress(researchId, 'Web Search', 'in_progress', '🔍 Executing web search across multiple sources...', {
      searchQuery: searchQuery.substring(0, 100) + '...',
      thinking: 'Searching news sites, financial reports, company websites, and industry publications',
      targeting: ['Market position', 'Financial performance', 'Competitive landscape', 'Industry trends']
    })
    
    let searchResults = null
    try {
      const tavilyResponse = await axios.post(TAVILY_BASE_URL, {
        api_key: TAVILY_API_KEY,
        query: searchQuery,
        search_depth: 'advanced',
        include_answer: true,
        max_results: 10
      })
      searchResults = tavilyResponse.data
      
      await updateProgress(researchId, 'Web Search', 'in_progress', '📰 Processing search results and extracting insights...', {
        resultsFound: searchResults?.results?.length || 0,
        thinking: 'Analyzing relevance and quality of discovered content',
        processing: 'Categorizing sources and extracting key information'
      })

      await new Promise(resolve => setTimeout(resolve, 800))
      
      await updateProgress(researchId, 'Web Search', 'completed', '✅ Successfully gathered market information from the web', {
        resultsFound: searchResults?.results?.length || 0,
        keyTopics: searchResults?.results?.slice(0, 3).map((r: any) => r.title) || [],
        searchQuery: searchQuery.substring(0, 100) + '...',
        thinking: 'Successfully compiled comprehensive market intelligence from web sources',
        keyFindings: {
          newsArticles: searchResults?.results?.filter((r: any) => r.url?.includes('news') || r.title?.toLowerCase().includes('news')).length || 0,
          companyMentions: searchResults?.results?.filter((r: any) => r.content?.toLowerCase().includes(companyName.toLowerCase())).length || 0,
          industryReports: searchResults?.results?.filter((r: any) => r.title?.toLowerCase().includes('report') || r.title?.toLowerCase().includes('analysis')).length || 0,
          topSources: searchResults?.results?.slice(0, 3).map((r: any) => ({
            title: r.title?.substring(0, 60) + '...' || 'Untitled',
            domain: r.url ? new URL(r.url).hostname : 'Unknown',
            relevanceScore: r.score || 'N/A'
          })) || []
        },
        dataSnapshot: {
          totalContent: searchResults?.results?.reduce((acc: number, r: any) => acc + (r.content?.length || 0), 0) || 0,
          avgContentLength: searchResults?.results?.length ? Math.round((searchResults?.results?.reduce((acc: number, r: any) => acc + (r.content?.length || 0), 0) || 0) / searchResults.results.length) : 0,
          uniqueDomains: [...new Set(searchResults?.results?.map((r: any) => r.url ? new URL(r.url).hostname : 'unknown'))].length || 0
        }
      })
      
      console.log('✅ Tavily search completed')
    } catch (error) {
      await updateProgress(researchId, 'Web Search', 'failed', 'Failed to retrieve web search results', {
        error: error instanceof Error ? error.message : 'Unknown error',
        thinking: 'Web search encountered technical difficulties - proceeding with available data'
      })
      console.error('❌ Tavily search failed:', error)
    }

    await updateProgress(researchId, 'Financial Data', 'in_progress', 'Looking up financial and stock market data', {
      dataSources: 'Alpha Vantage API',
      lookingFor: 'Stock prices, earnings, financial metrics, company overview'
    })

    // Step 2: Get financial data (if it's a public company)
    let financialData = null
    try {
      const symbol = await findCompanySymbol(companyName)
      if (symbol) {
        financialData = await getFinancialData(symbol)
        
        await updateProgress(researchId, 'Financial Data', 'completed', `Found financial data for stock symbol: ${symbol}`, {
          symbol,
          dataTypes: ['Quote', 'Company Overview', 'Earnings'],
          marketCap: financialData?.overview?.MarketCapitalization || 'N/A',
          sector: financialData?.overview?.Sector || 'N/A',
          keyMetrics: {
            currentPrice: financialData?.quote?.['Global Quote']?.['05. price'] || 'N/A',
            changePercent: financialData?.quote?.['Global Quote']?.['10. change percent'] || 'N/A',
            volume: financialData?.quote?.['Global Quote']?.['06. volume'] || 'N/A',
            marketCap: financialData?.overview?.MarketCapitalization || 'N/A',
            peRatio: financialData?.overview?.PERatio || 'N/A',
            dividendYield: financialData?.overview?.DividendYield || 'N/A'
          },
          companyInfo: {
            industry: financialData?.overview?.Industry || 'N/A',
            description: financialData?.overview?.Description?.substring(0, 150) + '...' || 'N/A',
            employees: financialData?.overview?.FullTimeEmployees || 'N/A',
            address: `${financialData?.overview?.Address || ''}, ${financialData?.overview?.City || ''}, ${financialData?.overview?.Country || ''}`.trim().replace(/^,|,$/, '') || 'N/A'
          },
          recentEarnings: {
            quarterlyEarnings: financialData?.earnings?.quarterlyEarnings?.slice(0, 2).map((q: any) => ({
              quarter: q.fiscalDateEnding,
              reportedEPS: q.reportedEPS,
              estimatedEPS: q.estimatedEPS,
              surprise: q.surprise
            })) || [],
            annualEarnings: financialData?.earnings?.annualEarnings?.slice(0, 2).map((a: any) => ({
              year: a.fiscalDateEnding,
              reportedEPS: a.reportedEPS
            })) || []
          }
        })
        
        console.log('✅ Financial data retrieved')
      } else {
        await updateProgress(researchId, 'Financial Data', 'completed', 'No stock symbol found - likely a private company', {
          note: 'Will focus on market and competitor analysis instead',
          searchAttempted: companyName,
          publicCompanyStatus: 'Private/Not Publicly Traded',
          alternativeDataSources: ['Web search results', 'Industry analysis', 'Competitor landscape']
        })
      }
    } catch (error) {
      await updateProgress(researchId, 'Financial Data', 'failed', 'Failed to retrieve financial data', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      console.error('❌ Financial data retrieval failed:', error)
    }

    await updateProgress(researchId, 'Competitor Analysis', 'in_progress', 'Identifying key competitors and market landscape', {
      searchStrategy: 'Industry analysis and competitive landscape research',
      thinking: 'Analyzing market to identify direct competitors, alternatives, and industry players'
    })

    // Step 3: Competitor analysis (using search results)
    let competitorData = null
    try {
      const competitorQuery = `${companyName} competitors alternative companies similar businesses industry`
      
      await updateProgress(researchId, 'Competitor Analysis', 'in_progress', '🔍 Searching for competitors and market alternatives...', {
        searchQuery: competitorQuery,
        thinking: 'Identifying companies that compete in the same market space',
        looking_for: ['Direct competitors', 'Market alternatives', 'Industry leaders', 'Similar business models']
      })
      
      const competitorResponse = await axios.post(TAVILY_BASE_URL, {
        api_key: TAVILY_API_KEY,
        query: competitorQuery,
        search_depth: 'basic',
        max_results: 5
      })
      competitorData = competitorResponse.data
      
      await updateProgress(researchId, 'Competitor Analysis', 'in_progress', '🏢 Analyzing competitive landscape...', {
        competitorsFound: competitorData?.results?.length || 0,
        thinking: 'Evaluating competitor relationships and market positioning',
        analyzing: ['Market overlap', 'Competitive positioning', 'Industry relationships']
      })

      await new Promise(resolve => setTimeout(resolve, 600))
      
      await updateProgress(researchId, 'Competitor Analysis', 'completed', '✅ Successfully identified competitive landscape', {
        competitorsFound: competitorData?.results?.length || 0,
        keyCompetitors: competitorData?.results?.slice(0, 3).map((r: any) => r.title) || [],
        thinking: 'Compiled comprehensive competitive intelligence and market positioning data',
        competitorInsights: {
          directCompetitors: competitorData?.results?.filter((r: any) => 
            r.title?.toLowerCase().includes('competitor') || 
            r.content?.toLowerCase().includes('competes with') ||
            r.content?.toLowerCase().includes('vs ' + companyName.toLowerCase())
          ).length || 0,
          industryPlayers: competitorData?.results?.filter((r: any) => 
            r.content?.toLowerCase().includes('industry') || 
            r.content?.toLowerCase().includes('market leader')
          ).length || 0,
          competitorMentions: competitorData?.results?.map((r: any) => {
            const content = r.content?.toLowerCase() || ''
            const title = r.title?.toLowerCase() || ''
            const matches: string[] = []
            
            // Common competitor keywords
            const competitorKeywords = ['rival', 'competitor', 'alternative', 'similar to', 'competes with', 'vs', 'compared to']
            competitorKeywords.forEach(keyword => {
              if (content.includes(keyword) || title.includes(keyword)) {
                matches.push(keyword)
              }
            })
            
            return {
              source: r.title?.substring(0, 40) + '...' || 'Untitled',
              matchedKeywords: matches,
              relevance: matches.length > 0 ? 'High' : 'Medium'
            }
          }).filter((item: any) => item.matchedKeywords.length > 0).slice(0, 3) || [],
        },
        marketContext: {
          totalSources: competitorData?.results?.length || 0,
          industryFocus: competitorData?.results?.filter((r: any) => 
            r.content?.toLowerCase().includes('industry') ||
            r.content?.toLowerCase().includes('sector') ||
            r.content?.toLowerCase().includes('market')
          ).length || 0
        }
      })
      
      console.log('✅ Competitor analysis completed')
    } catch (error) {
      await updateProgress(researchId, 'Competitor Analysis', 'failed', 'Failed to analyze competitors', {
        error: error instanceof Error ? error.message : 'Unknown error',
        thinking: 'Competitor analysis encountered difficulties - proceeding with available market data'
      })
      console.error('❌ Competitor analysis failed:', error)
    }

    await updateProgress(researchId, 'AI Analysis', 'in_progress', 'Processing all data with AI to generate strategic insights', {
      dataCollected: {
        webResults: !!searchResults,
        financialData: !!financialData,
        competitorData: !!competitorData
      },
      aiModel: 'Claude 3.5 Haiku',
      analysisScope: 'Market position, opportunities, threats, strategic recommendations'
    })

    // Step 4: AI Analysis with Claude (fallback to OpenAI if overloaded)
    let aiAnalysis = null
    let executiveSummary = null
    let marketPosition = null
    let competitors = null
    let opportunities = null
    let threats = null
    let recommendations = null

    try {
      const analysisPrompt = createAnalysisPrompt(companyName, searchResults, financialData, competitorData)
      let usedModel = 'Claude 3.5 Haiku'
      let analysis = ''
      
      // Show AI thinking process
      await updateProgress(researchId, 'AI Analysis', 'in_progress', '🤖 AI is analyzing collected data...', {
        thinking: 'Examining web search results, financial data, and competitor information',
        dataPoints: {
          webResults: searchResults?.results?.length || 0,
          financialMetrics: financialData ? Object.keys(financialData).length : 0,
          competitorSources: competitorData?.results?.length || 0
        }
      })

      await new Promise(resolve => setTimeout(resolve, 1000)) // Brief pause for visibility

      await updateProgress(researchId, 'AI Analysis', 'in_progress', '🧠 AI is synthesizing market insights...', {
        thinking: 'Processing patterns in market data and identifying key strategic themes',
        focus: ['Market positioning', 'Competitive landscape', 'Growth opportunities', 'Risk factors']
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      await updateProgress(researchId, 'AI Analysis', 'in_progress', '⚡ AI is generating strategic recommendations...', {
        thinking: 'Correlating financial performance with market trends to formulate actionable insights',
        analyzing: ['Revenue patterns', 'Market share dynamics', 'Competitive advantages', 'Industry threats']
      })
      
      try {
        // Try Anthropic first
        await updateProgress(researchId, 'AI Analysis', 'in_progress', '🎯 Running analysis through Claude AI model...', {
          model: 'Claude 3.5 Haiku',
          thinking: 'Applying advanced reasoning to generate comprehensive market analysis'
        })

        const response = await anthropic.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: analysisPrompt
          }]
        })

        const content = response.content[0]
        if (content.type === 'text') {
          analysis = content.text
        }
      } catch (anthropicError: any) {
        // If Anthropic is overloaded (529) or rate limited, fallback to OpenAI
        if (anthropicError.status === 529 || anthropicError.status === 429) {
          console.log('🔄 Anthropic overloaded, falling back to OpenAI...')
          await updateProgress(researchId, 'AI Analysis', 'in_progress', '🔄 Claude AI overloaded, switching to OpenAI GPT-4...', {
            fallback: 'Anthropic at capacity - seamlessly transitioning to OpenAI',
            thinking: 'Maintaining analysis quality with alternative AI model'
          })
          
          const openaiResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: analysisPrompt
            }]
          })
          
          analysis = openaiResponse.choices[0]?.message?.content || ''
          usedModel = 'OpenAI GPT-4o Mini'
          
          await updateProgress(researchId, 'AI Analysis', 'in_progress', '🎯 Analysis completed using OpenAI GPT-4...', {
            model: 'OpenAI GPT-4o Mini',
            thinking: 'Successfully generated insights using backup AI system'
          })
        } else {
          throw anthropicError
        }
      }

      if (analysis) {
        await updateProgress(researchId, 'AI Analysis', 'in_progress', '📊 AI is parsing and structuring insights...', {
          thinking: 'Breaking down analysis into executive summary, market position, competitors, opportunities, threats, and recommendations',
          processing: 'Extracting key insights from AI-generated analysis'
        })

        await new Promise(resolve => setTimeout(resolve, 500))

        const parsedAnalysis = parseAnalysis(analysis)
        
        aiAnalysis = analysis
        executiveSummary = parsedAnalysis.executiveSummary
        marketPosition = parsedAnalysis.marketPosition
        competitors = parsedAnalysis.competitors
        opportunities = parsedAnalysis.opportunities
        threats = parsedAnalysis.threats
        recommendations = parsedAnalysis.recommendations

        await updateProgress(researchId, 'AI Analysis', 'in_progress', '✨ AI has identified key strategic insights...', {
          thinking: 'Finalizing comprehensive market analysis with actionable recommendations',
          insights: {
            executiveSummary: executiveSummary ? '✅ Generated' : '❌ Missing',
            marketPosition: marketPosition ? '✅ Analyzed' : '❌ Missing',
            competitors: competitors && competitors.length > 0 ? `✅ Found ${competitors.length}` : '❌ None identified',
            opportunities: opportunities && opportunities.length > 0 ? `✅ Found ${opportunities.length}` : '❌ None identified',
            threats: threats && threats.length > 0 ? `✅ Found ${threats.length}` : '❌ None identified',
            recommendations: recommendations && recommendations.length > 0 ? `✅ Generated ${recommendations.length}` : '❌ None provided'
          }
        })

        await updateProgress(researchId, 'AI Analysis', 'completed', `🎉 AI analysis completed successfully using ${usedModel}`, {
          insightsGenerated: {
            executiveSummary: !!executiveSummary,
            marketPosition: !!marketPosition,
            competitors: competitors?.length || 0,
            opportunities: opportunities?.length || 0,
            threats: threats?.length || 0,
            recommendations: recommendations?.length || 0
          },
          analysisQuality: {
            dataSourcesUsed: [
              searchResults ? 'Web Search' : null,
              financialData ? 'Financial Data' : null,
              competitorData ? 'Competitor Analysis' : null
            ].filter(Boolean),
            totalTokensProcessed: analysisPrompt.length,
            aiModel: usedModel,
            confidence: searchResults && competitorData ? 'High' : financialData ? 'Medium' : 'Low'
          },
          keyInsights: {
            marketPositionSummary: marketPosition?.substring(0, 100) + '...' || 'N/A',
            topOpportunity: opportunities?.[0]?.substring(0, 80) + '...' || 'N/A',
            primaryThreat: threats?.[0]?.substring(0, 80) + '...' || 'N/A',
            mainRecommendation: recommendations?.[0]?.substring(0, 80) + '...' || 'N/A'
          },
          competitorAnalysis: {
            competitorsIdentified: competitors?.slice(0, 3) || [],
            competitiveAdvantages: executiveSummary?.toLowerCase().includes('advantage') ? 'Identified' : 'Not specified',
            marketShare: executiveSummary?.toLowerCase().includes('market share') || marketPosition?.toLowerCase().includes('market share') ? 'Discussed' : 'Not mentioned'
          },
          finalThoughts: 'Analysis complete - ready for strategic decision making'
        })
      }

      console.log(`✅ AI analysis completed using ${usedModel}`)
    } catch (error) {
      await updateProgress(researchId, 'AI Analysis', 'failed', '❌ AI analysis encountered an error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        thinking: 'Unable to complete AI analysis - proceeding with collected raw data',
        note: 'Research completed using web search and financial data'
      })
      console.error('❌ AI analysis failed:', error)
    }

    // Final progress update
    await updateProgress(researchId, 'Finalizing', 'completed', 'Market research completed successfully', {
      summary: {
        dataCollected: {
          webSearch: !!searchResults,
          financialData: !!financialData,
          competitorAnalysis: !!competitorData,
          aiInsights: !!aiAnalysis
        },
        completedAt: new Date().toISOString()
      }
    })

    // Update the market research record
    await prisma.marketResearch.update({
      where: { id: researchId },
      data: {
        status: 'COMPLETED',
        searchResults,
        financialData: financialData || undefined,
        competitorData,
        executiveSummary,
        marketPosition,
        competitors: competitors && competitors.length > 0 ? JSON.stringify(competitors) : undefined,
        opportunities: opportunities && opportunities.length > 0 ? JSON.stringify(opportunities) : undefined,
        threats: threats && threats.length > 0 ? JSON.stringify(threats) : undefined,
        recommendations: recommendations && recommendations.length > 0 ? JSON.stringify(recommendations) : undefined,
        lastUpdated: new Date()
      }
    })

    console.log('✅ Market research completed successfully')

  } catch (error) {
    console.error('❌ Market research failed:', error)
    
    await updateProgress(researchId, 'Error', 'failed', 'Market research failed due to an unexpected error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    
    // Update status to failed
    await prisma.marketResearch.update({
      where: { id: researchId },
      data: {
        status: 'FAILED',
        lastUpdated: new Date()
      }
    })
  }
}

async function findCompanySymbol(companyName: string): Promise<string | null> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: companyName,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    })

    const matches = response.data?.bestMatches
    if (matches && matches.length > 0) {
      return matches[0]['1. symbol']
    }
    return null
  } catch (error) {
    console.error('Error finding company symbol:', error)
    return null
  }
}

async function getFinancialData(symbol: string) {
  try {
    const [quote, overview, earnings] = await Promise.all([
      // Get current quote
      axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      }),
      // Get company overview
      axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      }),
      // Get earnings
      axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'EARNINGS',
          symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      })
    ])

    return {
      symbol,
      quote: quote.data,
      overview: overview.data,
      earnings: earnings.data
    }
  } catch (error) {
    console.error('Error getting financial data:', error)
    return null
  }
}

function createAnalysisPrompt(companyName: string, searchResults: unknown, financialData: unknown, competitorData: unknown): string {
  return `
As a senior market research analyst, please analyze the following data about ${companyName} and provide a comprehensive market research report.

SEARCH RESULTS:
${JSON.stringify(searchResults, null, 2)}

FINANCIAL DATA:
${JSON.stringify(financialData, null, 2)}

COMPETITOR DATA:
${JSON.stringify(competitorData, null, 2)}

Please provide your analysis in the following structured format:

## EXECUTIVE SUMMARY
[2-3 sentence overview of key findings]

## MARKET POSITION
[Analysis of the company's position in the market, market share, competitive advantages]

## KEY COMPETITORS
[List of 3-5 main competitors with brief descriptions]

## OPPORTUNITIES
[3-5 key growth opportunities and market trends]

## THREATS
[3-5 key risks and challenges]

## STRATEGIC RECOMMENDATIONS
[3-5 actionable recommendations for growth and risk mitigation]

Focus on being factual, data-driven, and actionable. If information is limited, clearly state assumptions and data limitations.
`
}

function parseAnalysis(analysis: string) {
  const sections = {
    executiveSummary: extractSection(analysis, 'EXECUTIVE SUMMARY'),
    marketPosition: extractSection(analysis, 'MARKET POSITION'),
    competitors: extractCompetitors(analysis),
    opportunities: extractStructuredList(analysis, 'OPPORTUNITIES'),
    threats: extractStructuredList(analysis, 'THREATS'),
    recommendations: extractStructuredList(analysis, 'STRATEGIC RECOMMENDATIONS')
  }
  
  return sections
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\s*\n([\\s\\S]*?)(?=\\n## |$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function extractCompetitors(text: string): Array<{name: string, description: string}> {
  const section = extractSection(text, 'KEY COMPETITORS')
  if (!section) return []
  
  const competitors: Array<{name: string, description: string}> = []
  const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[-*•]\s*/, '') // Remove bullet points
    if (cleanLine.includes(':') || cleanLine.includes('-')) {
      const parts = cleanLine.split(/[:–-]/, 2)
      if (parts.length >= 2) {
        competitors.push({
          name: parts[0].trim(),
          description: parts[1].trim()
        })
      }
    } else if (cleanLine.length > 0) {
      competitors.push({
        name: cleanLine,
        description: ''
      })
    }
  }
  
  return competitors
}

function extractStructuredList(text: string, sectionName: string): Array<{title: string, description: string}> {
  const section = extractSection(text, sectionName)
  if (!section) return []
  
  const items: Array<{title: string, description: string}> = []
  const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  for (const line of lines) {
    const cleanLine = line.replace(/^[-*•]\s*/, '') // Remove bullet points
    if (cleanLine.includes(':') || cleanLine.includes('-')) {
      const parts = cleanLine.split(/[:–-]/, 2)
      if (parts.length >= 2) {
        items.push({
          title: parts[0].trim(),
          description: parts[1].trim()
        })
      }
    } else if (cleanLine.length > 0) {
      items.push({
        title: cleanLine,
        description: ''
      })
    }
  }
  
  return items
}

function extractListSection(text: string, sectionName: string): string[] {
  const section = extractSection(text, sectionName)
  if (!section) return []
  
  // Split by lines and filter out empty lines
  return section
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.replace(/^[-*•]\s*/, '')) // Remove bullet points
} 