import React from 'react';
import { Button, Card, Avatar, Divider, Tag } from 'antd';
import { TeamOutlined, BulbOutlined, HeartFilled, RocketOutlined } from '@ant-design/icons';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Social entrepreneur with 10+ years in community development',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Maria Garcia',
      role: 'CTO',
      bio: 'Tech innovator focused on inclusive financial systems',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Sam Wilson',
      role: 'Community Lead',
      bio: 'Connector of people and passionate causes',
      avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            To empower creators and change-makers by connecting them with a global community of backers who believe in their vision.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="large" className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8">
              Meet the Team
            </Button>
            <Button size="large" type="primary" className="h-12 px-8 bg-blue-700 hover:bg-blue-800">
              Join Our Community
            </Button>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Tag icon={<BulbOutlined />} color="blue" className="mb-6 text-lg">
              Since 2018
            </Tag>
            <h2 className="text-3xl font-bold mb-8">From Small Idea to Global Movement</h2>
            <div className="space-y-6 text-lg text-gray-700">
              <p>
                FundFlow began when our founder noticed talented creators struggling to find funding for their projects. 
                What started as a local platform in San Francisco has grown into a worldwide community supporting 
                over 50,000 projects across 150 countries.
              </p>
              <p>
                We've facilitated more than $200M in pledges, helping bring everything from life-saving medical 
                devices to groundbreaking art installations to life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartFilled className="text-blue-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community First</h3>
              <p className="text-gray-600">
                We believe the best ideas emerge when diverse perspectives come together.
              </p>
            </Card>
            
            <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <RocketOutlined className="text-purple-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Radical Transparency</h3>
              <p className="text-gray-600">
                Clear communication builds trust between creators and backers.
              </p>
            </Card>
            
            <Card className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <TeamOutlined className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inclusive Access</h3>
              <p className="text-gray-600">
                We break down barriers to funding for underrepresented creators.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Meet the Team</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-all">
                <Avatar size={128} src={member.avatar} className="mb-6 mx-auto" />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-blue-600 mb-4">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Make an Impact?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're a creator with a dream or a backer who wants to support innovation, we'd love to have you.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="large" type="primary" className="h-12 px-8 bg-blue-600 hover:bg-blue-700">
              Start a Campaign
            </Button>
            <Button size="large" className="h-12 px-8">Browse Projects</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <HeartFilled className="text-red-500 text-xl" />
              <span className="text-xl font-bold">FundFlow</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto mb-6">
              The world's most trusted crowdfunding platform for bringing creative projects to life.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
          <Divider className="bg-gray-700 my-8" />
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} FundFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;