#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 ShopEase AI Chat Agent - Quick Setup${NC}\n"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Install root dependencies
echo -e "\n${BLUE}📦 Installing root dependencies...${NC}"
npm install

# Install server dependencies
echo -e "\n${BLUE}📦 Installing server dependencies...${NC}"
cd server && npm install && cd ..

# Install client dependencies
echo -e "\n${BLUE}📦 Installing client dependencies...${NC}"
cd client && npm install && cd ..

# Setup environment files
echo -e "\n${BLUE}🔧 Setting up environment files...${NC}"

if [ ! -f server/.env ]; then
    cp server/.env.example server/.env
    echo -e "${GREEN}✓ Created server/.env${NC}"
    echo -e "${YELLOW}⚠️  Please update server/.env with your credentials${NC}"
else
    echo -e "${GREEN}✓ server/.env already exists${NC}"
fi

if [ ! -f client/.env.local ]; then
    cp client/.env.local.example client/.env.local
    echo -e "${GREEN}✓ Created client/.env.local${NC}"
else
    echo -e "${GREEN}✓ client/.env.local already exists${NC}"
fi

echo -e "\n${BLUE}🗄️  Setting up Prisma...${NC}"
cd server
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

echo -e "\n${GREEN}✨ Setup complete!${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Update ${BLUE}server/.env${NC} with your database and API credentials"
echo -e "2. Run: ${BLUE}cd server && npx prisma migrate dev${NC}"
echo -e "3. Run: ${BLUE}npm run dev${NC} from the root directory"
echo -e "\n${GREEN}Happy coding! 🎉${NC}\n"
