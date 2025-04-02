import React from 'react';
import { Button, Card, Avatar, Progress, Tag } from 'antd';
import { SearchOutlined, FireOutlined, StarOutlined, HeartFilled } from '@ant-design/icons';
import Navbar from '../components/Navbar'

const Home = () => {
  // Sample data
  const featuredCampaigns = [
    {
      id: 1,
      title: 'Clean Water for Rural Villages',
      creator: 'WaterAid',
      pledged: 12500,
      goal: 30000,
      backers: 184,
      daysLeft: 15,
      image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35',
      category: 'Environment'
    },
    {
      id: 2,
      title: 'Education for Underprivileged Kids',
      creator: 'TeachForAll',
      pledged: 42000,
      goal: 50000,
      backers: 312,
      daysLeft: 8,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
      category: 'Education'
    },
    {
      id: 3,
      title: 'Innovative Solar-Powered Device',
      creator: 'GreenTech',
      pledged: 68000,
      goal: 75000,
      backers: 429,
      daysLeft: 22,
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d',
      category: 'Technology'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Bring creative projects to life</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            FundFlow is where millions of people discover and back inspiring projects.
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search projects..." 
                  className="w-full py-4 px-6 rounded-l-lg focus:outline-none text-gray-800"
                />
                <SearchOutlined className="absolute right-4 top-4 text-gray-400" />
              </div>
              <Button 
                type="primary" 
                size="large" 
                className="h-auto px-8 rounded-l-none rounded-r-lg bg-blue-700 hover:bg-blue-800"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {['Technology', 'Art', 'Education', 'Environment', 'Health', 'Community'].map((category) => (
              <Card 
                key={category} 
                hoverable 
                className="text-center border-gray-200 hover:border-blue-400"
              >
                <div className="p-4">
                  <Avatar size={48} className="mb-3 bg-blue-100 text-blue-600">
                    {category.charAt(0)}
                  </Avatar>
                  <h3 className="font-medium">{category}</h3>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Campaigns</h2>
            <Button type="link" className="text-blue-600">View all</Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <Card 
                key={campaign.id}
                hoverable
                cover={
                  <img 
                    alt={campaign.title} 
                    src={campaign.image} 
                    className="h-48 object-cover"
                  />
                }
              >
                <Tag color="red" className="mb-3">
                  <FireOutlined /> Trending
                </Tag>
                
                <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
                <p className="text-gray-600 mb-4">by {campaign.creator}</p>
                
                <Progress 
                  percent={Math.round((campaign.pledged / campaign.goal) * 100)} 
                  strokeColor="#1890ff"
                  className="mb-4"
                />
                
                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>${campaign.pledged.toLocaleString()} pledged</span>
                  <span>{Math.round((campaign.pledged / campaign.goal)) * 100}%</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span><StarOutlined /> {campaign.backers} backers</span>
                  <span>{campaign.daysLeft} days left</span>
                </div>
                
                <Button 
                  type="primary" 
                  block 
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  Back This Project
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to bring your idea to life?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've funded their projects on FundFlow.
          </p>
          <Button 
            type="primary" 
            size="large" 
            className="bg-purple-600 hover:bg-purple-700 px-8 h-12 text-lg"
          >
            Start Your Campaign
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <HeartFilled className="text-red-500 text-xl" />
                <span className="text-xl font-bold">FundFlow</span>
              </div>
              <p className="text-gray-400">
                The world's leading crowdfunding platform for creative projects.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Discover</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Projects</a></li>
                <li><a href="#" className="hover:text-white">Categories</a></li>
                <li><a href="#" className="hover:text-white">Trending</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">About</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">How it Works</a></li>
                <li><a href="#" className="hover:text-white">Our Story</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            © {new Date().getFullYear()} FundFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;