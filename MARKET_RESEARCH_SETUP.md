# 🚀 Market Research Setup Guide

Your application now includes an AI-powered market research feature that provides comprehensive analysis of companies including:

- **Web Search**: Latest market information and news
- **Financial Data**: Stock information, earnings, and financial metrics  
- **AI Analysis**: Intelligent insights and strategic recommendations
- **Competitor Analysis**: Identification of key competitors and market positioning

## 🔑 Required API Keys

You need to add these API keys to your `.env` file:

### 1. Tavily AI (Search Engine)
- **Purpose**: Web search and real-time information gathering
- **Free Tier**: 1,000 searches/month
- **Cost**: $0.001 per search (very affordable)
- **Get Key**: https://tavily.com/
- **Add to .env**: `TAVILY_API_KEY=your_tavily_api_key_here`

### 2. Anthropic Claude (AI Analysis)
- **Purpose**: Intelligent analysis and strategic insights
- **Cost**: Pay-per-use (most cost-effective AI model)
- **Model Used**: Claude 3.5 Haiku ($0.80/MTok input, $4/MTok output)
- **Get Key**: https://console.anthropic.com/
- **Add to .env**: `ANTHROPIC_API_KEY=your_anthropic_api_key_here`

### 3. Alpha Vantage (Financial Data)
- **Purpose**: Stock prices, financial data, company information
- **Free Tier**: 25 requests/day (generous for testing)
- **Premium**: $49.99/month for real-time data
- **Get Key**: https://www.alphavantage.co/support/#api-key
- **Add to .env**: `ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here`

## 📝 Setup Instructions

1. **Get your API keys** from the providers above
2. **Add them to your `.env` file**:
   ```env
   # Market Research API Keys
   TAVILY_API_KEY=your_tavily_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here  
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## 🎯 How to Use

1. **Navigate** to any company page in your dashboard
2. **Click** on the "Market Research" tab  
3. **Click** "Start AI Research" button
4. **Wait** for the AI to analyze (typically 1-3 minutes)
5. **Review** the comprehensive research report

## 📊 What You Get

### Executive Summary
- Key findings and overview of the company's market position

### Market Analysis  
- Market position assessment
- Industry trends and dynamics
- Competitive landscape overview

### Strategic Insights
- **Opportunities**: Growth potential and market trends
- **Threats**: Risk factors and challenges  
- **Competitors**: Key players in the market
- **Recommendations**: Actionable strategic advice

### Financial Data (if public company)
- Current stock information
- Financial metrics and ratios
- Earnings data and performance

## 💰 Cost Estimation

For a typical market research report:
- **Tavily Search**: ~$0.01 (10 searches)
- **Claude Analysis**: ~$0.10 (25K tokens)
- **Alpha Vantage**: Free (within daily limit)
- **Total per research**: ~$0.11

Very affordable for the comprehensive insights you receive!

## 🔧 Troubleshooting

### "Research Failed" Status
- Check that all API keys are correctly set
- Verify API keys have sufficient credits/quota
- Check console logs for specific error messages

### No Financial Data
- Financial data only available for public companies
- Alpha Vantage requires exact company names or stock symbols
- Private companies will still get market and competitor analysis

### Research Takes Too Long
- Typical research takes 1-3 minutes
- Complex companies may take up to 5 minutes
- If it takes longer, check your API rate limits

## 🚀 Next Steps

Once set up, you can:
- Research any company in your database
- Export findings to notes or documents  
- Use insights for business development
- Track competitor analysis over time

The market research feature uses the most generous free tiers available, making it cost-effective for regular use! 