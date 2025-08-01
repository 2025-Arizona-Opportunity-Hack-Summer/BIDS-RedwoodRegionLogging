'use client'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  FiAward, 
  FiUsers, 
  FiDollarSign, 
  FiTrendingUp,
  FiArrowRight,
  FiShield,
  FiClock
} from "react-icons/fi";

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-white p-10 rounded-xl border-2 border-accent-dark hover:border-primary hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-in-out">
      <div className="flex flex-col items-start gap-4">
        <Icon className="w-8 h-8 text-primary" />
        <h3 className="text-lg font-semibold text-primary" style={{ fontSize: '1.125rem', margin: '0.25rem 0' }}>
          {title}
        </h3>
        <p className="text-primary-dark leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <h2 className="text-4xl font-bold text-white" style={{ fontSize: '2.25rem', margin: '0.5rem 0' }}>
        {number}
      </h2>
      <p className="text-white/90 text-lg">
        {label}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-accent">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary to-primary-light text-white py-28 px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 2px, transparent 2px)',
            backgroundSize: '50px 50px'
          }}
        />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
              🌲 Empowering Future Forest Stewards
            </div>
            
            <div className="space-y-2">
              <h1 className="text-6xl font-bold max-w-4xl leading-tight" style={{ fontSize: '3.75rem', margin: '0.5rem 0' }}>
                Redwood Region Logging Conference
              </h1>
              <div className="text-6xl font-bold text-accent">
                Scholarship Portal
              </div>
            </div>
            
            <p className="text-xl opacity-90 max-w-2xl leading-relaxed">
              Supporting the next generation of sustainable forestry professionals through 
              educational scholarships and career development opportunities.
            </p>
            
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <Link href="/scholarships">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-accent hover:-translate-y-0.5 font-bold px-8 transition-transform"
                >
                  Explore Scholarships
                  <FiArrowRight className="ml-2" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10 hover:border-white px-8"
                >
                  Apply Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary-dark py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="$250K+" label="Awarded Annually" />
            <StatCard number="150+" label="Students Supported" />
            <StatCard number="25+" label="Partner Organizations" />
            <StatCard number="98%" label="Graduation Rate" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 text-center pb-8">
              <h2 className="text-4xl font-bold text-primary" style={{ fontSize: '2.25rem', margin: '0.5rem 0' }}>
                Why Choose RRLC Scholarships?
              </h2>
              <p className="text-xl text-primary-dark max-w-2xl mx-auto">
                We&apos;re committed to fostering sustainable forestry education and 
                supporting students who will become tomorrow&apos;s environmental leaders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <FeatureCard
                icon={FiDollarSign}
                title="Financial Support"
                description="Competitive scholarship amounts ranging from $1,000 to $10,000 to help cover tuition, books, and living expenses."
              />
              
              <FeatureCard
                icon={FiUsers}
                title="Mentorship Network"
                description="Connect with industry professionals and RRLC members for guidance, internships, and career opportunities."
              />
              
              <FeatureCard
                icon={FiAward}
                title="Merit & Need Based"
                description="Awards recognize both academic excellence and financial need, ensuring opportunities for all qualified students."
              />
              
              <FeatureCard
                icon={FiTrendingUp}
                title="Career Development"
                description="Access to exclusive workshops, conferences, and networking events in the forestry and logging industry."
              />
              
              <FeatureCard
                icon={FiShield}
                title="Renewable Awards"
                description="Many scholarships are renewable for multiple years, providing ongoing support throughout your education."
              />
              
              <FeatureCard
                icon={FiClock}
                title="Rolling Applications"
                description="Multiple application deadlines throughout the year, giving you flexibility in when to apply."
              />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl font-bold text-primary" style={{ fontSize: '2.25rem', margin: '0.5rem 0' }}>
                Ready to Invest in Your Future?
              </h2>
              <p className="text-lg text-primary-dark leading-relaxed">
                Join hundreds of students who have launched successful careers in 
                sustainable forestry with support from RRLC scholarships.
              </p>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link href="/scholarships">
                <Button
                  size="lg"
                  className="bg-primary text-white hover:bg-primary-light px-8"
                >
                  View Available Scholarships
                  <FiArrowRight className="ml-2" />
                </Button>
              </Link>
              
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent-dark text-primary hover:bg-accent hover:border-primary px-8"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}