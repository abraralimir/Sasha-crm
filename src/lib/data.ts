import type { Kpi, Lead } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

const getAvatarUrl = (seed: number) => `https://picsum.photos/seed/${seed}/40/40`;

export const leads: Lead[] = [
  {
    id: '1',
    contactName: 'Alice Johnson',
    companyName: 'Innovate Inc.',
    email: 'alice.j@innovate.com',
    phone: '555-0101',
    status: 'Proposal',
    potentialRevenue: 75000,
    lastContacted: '2023-10-26T10:00:00Z',
    avatar: getAvatarUrl(1),
    notes: 'Innovate Inc. is a tech startup focusing on AI-driven solutions for the healthcare industry. They have a strong engineering team but lack project management expertise.',
    projectScope: 'Develop a custom patient management system with predictive analytics features.',
    projectComplexity: 'High',
    historicalData: 'Similar projects in the healthcare tech space have shown an average ROI of 150% over 2 years, with a 70% project success rate when managed by an experienced team.',
    marketTrends: 'The healthcare AI market is rapidly growing, with a high demand for personalized patient care solutions. Key competitors are focusing on data security and interoperability.'
  },
  {
    id: '2',
    contactName: 'Bob Williams',
    companyName: 'Quantum Solutions',
    email: 'bob.w@quantum.com',
    phone: '555-0102',
    status: 'Contacted',
    potentialRevenue: 50000,
    lastContacted: '2023-10-25T14:30:00Z',
    avatar: getAvatarUrl(2),
    notes: 'Quantum Solutions is a mid-sized logistics company looking to optimize their supply chain with technology.',
    projectScope: 'Implement an inventory tracking system and a route optimization module for their delivery fleet.',
    projectComplexity: 'Medium',
    historicalData: 'Logistics tech projects typically yield a 20-30% reduction in operational costs. Our past projects in this sector have a 90% on-time delivery record.',
    marketTrends: 'The logistics industry is facing pressure to adopt greener technologies and improve last-mile delivery efficiency. IoT and data analytics are key trends.'
  },
  {
    id: '3',
    contactName: 'Charlie Brown',
    companyName: 'Fintech Corp.',
    email: 'charlie.b@fintech.co',
    phone: '555-0103',
    status: 'New',
    potentialRevenue: 120000,
    lastContacted: '2023-10-27T09:00:00Z',
    avatar: getAvatarUrl(3),
    notes: 'A major player in the financial services industry, seeking to build a new mobile banking application.',
    projectScope: 'Design and build a secure, user-friendly mobile banking app for iOS and Android with features for transfers, bill payments, and investment tracking.',
    projectComplexity: 'High',
    historicalData: 'Mobile banking app projects are complex and have a high dependency on security compliance. Past successful projects have led to a 40% increase in user engagement for our clients.',
    marketTrends: 'Neobanks and digital wallets are disrupting traditional banking. User experience and robust security are paramount to compete effectively.'
  },
  {
    id: '4',
    contactName: 'Diana Prince',
    companyName: 'Retail Giant',
    email: 'diana.p@retailgiant.com',
    phone: '555-0104',
    status: 'Closed',
    potentialRevenue: 250000,
    lastContacted: '2023-09-15T11:00:00Z',
    avatar: getAvatarUrl(4),
    notes: 'A large retail chain that required a complete e-commerce platform overhaul.',
    projectScope: 'Rebuild the e-commerce website with a modern tech stack, personalized recommendations, and a streamlined checkout process.',
    projectComplexity: 'High',
    historicalData: 'E-commerce overhauls for large retailers have resulted in an average 25% increase in online sales and a 15% improvement in conversion rates.',
    marketTrends: 'Omnichannel retail, social commerce, and headless e-commerce architecture are dominant trends. Personalization engines are key for customer retention.'
  },
  {
    id: '5',
    contactName: 'Ethan Hunt',
    companyName: 'Creative Agency',
    email: 'ethan.h@creative.io',
    phone: '555-0105',
    status: 'Lost',
    potentialRevenue: 30000,
    lastContacted: '2023-10-20T16:00:00Z',
    avatar: getAvatarUrl(5),
    notes: 'A small creative agency that needed a new portfolio website. They chose a cheaper, template-based solution.',
    projectScope: 'Design a visually stunning portfolio website to showcase their work.',
    projectComplexity: 'Low',
    historicalData: 'Small agency websites are often budget-sensitive. Profit margins are lower, but they can be quick wins if the scope is well-defined.',
    marketTrends: 'Webflow, Framer, and other no-code tools are popular among smaller agencies for their speed and cost-effectiveness.'
  },
   {
    id: '6',
    contactName: 'Fiona Glenanne',
    companyName: 'GreenEnergy Co.',
    email: 'fiona.g@greenenergy.co',
    phone: '555-0106',
    status: 'Proposal',
    potentialRevenue: 95000,
    lastContacted: '2023-10-28T11:30:00Z',
    avatar: getAvatarUrl(6),
    notes: 'A company specializing in renewable energy solutions, looking for a platform to monitor their solar farms.',
    projectScope: 'Create a real-time monitoring dashboard for solar farm performance, including energy output, maintenance alerts, and weather integration.',
    projectComplexity: 'Medium',
    historicalData: 'IoT and data visualization projects in the energy sector have improved operational efficiency by up to 18%. Security is a major consideration.',
    marketTrends: 'The renewable energy sector is heavily investing in digital twins and predictive maintenance technologies to maximize asset lifespan and efficiency.'
  },
];

export const kpis: Kpi[] = [
  {
    title: 'Expected Revenue',
    value: '$440,500',
    change: '+15.2%',
    changeType: 'increase',
    description: 'From active leads in proposal stage',
  },
  {
    title: 'Conversion Rate',
    value: '62.5%',
    change: '-3.1%',
    changeType: 'decrease',
    description: 'Lead to closed deal ratio this quarter',
  },
  {
    title: 'New Leads',
    value: '12',
    change: '+8.0%',
    changeType: 'increase',
    description: 'This month from Sasha Consulting',
  },
  {
    title: 'Avg. Deal Size',
    value: '$110,125',
    change: '+5.5%',
    changeType: 'increase',
    description: 'Average potential revenue of all leads',
  },
];

export function getLeadById(id: string): Lead | undefined {
  return leads.find(lead => lead.id === id);
}

export const getAvatars = () => {
    return PlaceHolderImages.reduce((acc, img) => {
        acc[img.id] = img.imageUrl;
        return acc;
    }, {} as Record<string, string>);
}
