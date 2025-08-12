'use client'

import Link from 'next/link'
import { 
  User, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap, 
  Target,
  Star,
  ChevronRight,
  Mail,
  Phone,
  Users,
  BarChart3,
  Database,
  Lock,
  Globe,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">i</span>
              </div>
              <span className="text-xl font-bold text-gray-900">iSkala Enrich</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Product</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 transition-colors">Resources</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <Link href="/dashboard" className="btn-primary">
                      Go to Dashboard →
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                        Login
                      </Link>
                      <Link href="/auth/signup" className="btn-primary">
                        Start for free →
                      </Link>
                    </>
                  )}
                </>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <nav className="space-y-2">
                  <a href="#features" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Product</a>
                  <a href="#pricing" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
                  <a href="#use-cases" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Use Cases</a>
                  <a href="#resources" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">Resources</a>
                </nav>
                
                {!loading && (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {user ? (
                      <Link href="/dashboard" className="block w-full text-center btn-primary">
                        Go to Dashboard →
                      </Link>
                    ) : (
                      <>
                        <Link href="/auth/login" className="block py-2 text-gray-600 hover:text-gray-900 transition-colors">
                          Login
                        </Link>
                        <Link href="/auth/signup" className="block w-full text-center btn-primary">
                          Start for free →
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Convert leads you<br/>
            <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
              couldn't reach before
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Access 20+ data providers through iSkala Enrich to unlock new revenue opportunities by maximizing email and mobile phone number enrichments.
          </p>
          
          <div className="flex justify-center mb-8">
            {!loading && (
              <>
                {user ? (
                  <Link href="/dashboard" className="btn-primary flex items-center justify-center text-lg py-4 px-12">
                    <span className="text-2xl mr-3">🚀</span>
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/auth/signup" className="btn-primary flex items-center justify-center text-lg py-4 px-12">
                    <span className="text-2xl mr-3">🚀</span>
                    Get Started Free
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Access untouched opportunities</h3>
              <p className="text-gray-600">
                Reach prospects your competitors don't have contact data for. These leads don't get outreached often and can thus be closed more easily.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Only charged for valid data</h3>
              <p className="text-gray-600">
                Each mobile phone number and email gets externally verified through a 4-layer validation system. Only get charged if it's truly valid.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Full data compliance</h3>
              <p className="text-gray-600">
                iSkala Enrich is fully compliant with GDPR/CCPA/DSGVO. We securely process +150,000 data enrichments daily for +1,000 companies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-primary-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            You remember the last time you couldn't reach out to a promising lead?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
              <div className="text-red-600 mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700">Miss out on +45% promising leads.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700">Still get charged for invalid & unusable data.</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
              <div className="text-green-600 mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <ul className="space-y-3 text-left">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700">Maximize the found contact data.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700">Only get charged if data is actually valid.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">+800 outbound experts trust iSkala Enrich</h2>
          
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-8 border">
            <div className="flex items-center justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-gray-700 mb-6 italic">
              "iSkala Enrich allows us to reach out to 31% more sales opportunities through cold calling. Getting access to mobile phone numbers that other providers don't find is a game changer."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <div className="font-semibold text-gray-900">Michael Ewald</div>
                <div className="text-gray-600">Founder & CEO, Vangates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-accent-100/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-accent-200/30 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full mb-6">
              <span className="text-primary-700 font-semibold text-sm">✨ 5-Step Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              How To Maximize Contact Data<br/>
              <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
                Coverage & Quality
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Without Paying For Invalid Data
            </p>
          </div>
          
          <div className="max-w-7xl mx-auto">
            {[
              {
                step: "01",
                stepTitle: "CONTACT IMPORT",
                title: "Import leads from multiple sources",
                description: "Import contacts through API, CSV/Excel, or CRM in 1-click. Alternatively, use iSkala Enrich directly in our 10+ native integrations.",
                icon: <Database className="w-8 h-8 text-white" />,
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100",
                borderColor: "border-blue-200",
                features: ["API Integration", "CSV/Excel Upload", "CRM Sync", "10+ Native Integrations"]
              },
              {
                step: "02",
                stepTitle: "AI ANALYSIS",
                title: "Let AI find the optimal data sources sequence",
                description: "Every data provider has its unique strengths. Our iSkala AI algorithm analyzes your contacts information and builds the optimal sequence on which providers to request first.",
                icon: <Zap className="w-8 h-8 text-white" />,
                color: "from-purple-500 to-purple-600",
                bgColor: "from-purple-50 to-purple-100",
                borderColor: "border-purple-200",
                features: ["Smart Algorithm", "Provider Analysis", "Optimal Sequencing", "AI-Powered Matching"]
              },
              {
                step: "03",
                stepTitle: "WATERFALL ENRICHMENT",
                title: "Data enrichment with 20+ premium data providers",
                description: "The optimal data provider sequence requests up to 20+ data sources and looks until a successful match has been found.",
                icon: <BarChart3 className="w-8 h-8 text-white" />,
                color: "from-green-500 to-green-600",
                bgColor: "from-green-50 to-green-100",
                borderColor: "border-green-200",
                features: ["20+ Data Providers", "Waterfall Process", "Premium Sources", "High Success Rate"]
              },
              {
                step: "04",
                stepTitle: "DATA VERIFICATION",
                title: "4 verification layers. Only get charged if truly valid",
                description: "The mobile phone number and email gets validated and scored through 4 different verification layers. If contact data is invalid after testing, the next provider gets requested. 0 charge for invalid data.",
                icon: <Shield className="w-8 h-8 text-white" />,
                color: "from-red-500 to-red-600",
                bgColor: "from-red-50 to-red-100",
                borderColor: "border-red-200",
                features: ["4-Layer Verification", "Zero Invalid Charges", "Quality Scoring", "Automatic Validation"]
              },
              {
                step: "05",
                stepTitle: "CONTACT EXPORT",
                title: "Export data to your tools in 1-click",
                description: "Export enriched contact to the place you need it in 1 click: CRM, Outreach tool, no code platform.",
                icon: <ArrowRight className="w-8 h-8 text-white" />,
                color: "from-orange-500 to-orange-600",
                bgColor: "from-orange-50 to-orange-100",
                borderColor: "border-orange-200",
                features: ["1-Click Export", "CRM Integration", "Outreach Tools", "No-Code Platforms"]
              }
            ].map((item, index) => (
              <div key={index} className="mb-16 last:mb-0">
                <div className={`bg-gradient-to-br ${item.bgColor} rounded-3xl border ${item.borderColor} p-8 md:p-12 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}>
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Left side - Step number and icon */}
                    <div className="text-center lg:text-left">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg mb-6">
                        <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          {item.icon}
                        </div>
                      </div>
                      <div className="text-6xl font-bold text-gray-300 mb-2">{item.step}</div>
                      <div className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{item.stepTitle}</div>
                    </div>
                    
                    {/* Center - Content */}
                    <div className="lg:col-span-2">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{item.title}</h3>
                      <p className="text-lg text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                      
                      {/* Features grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {item.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <div className={`w-2 h-2 bg-gradient-to-r ${item.color} rounded-full flex-shrink-0`}></div>
                            <span className="text-sm font-medium text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <span className="text-2xl mr-3">🚀</span>
              <span className="text-lg font-semibold">Ready to get started?</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-xl text-gray-600">Start free, scale as you grow</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$15",
                credits: "200",
                features: ["200 Credits", "Phone verification", "API access"]
              },
              {
                name: "Pro",
                price: "$49",
                credits: "1000",
                features: ["1000 Credits", "Priority support", "Advanced features"],
                popular: true
              },
              {
                name: "Growth",
                price: "$200",
                credits: "5000",
                features: ["5000 Credits", "Enterprise features", "Dedicated support"]
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-2xl border-2 p-8 ${plan.popular ? 'border-primary-500 shadow-xl scale-105' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {user ? (
                    <Link 
                      href="/dashboard" 
                      className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link 
                      href="/auth/signup" 
                      className={`w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Get Started
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            You're 45 seconds Away from Getting Access to Leads you couldn't reach out to before
          </h2>
          
          <div className="flex items-center justify-center space-x-8 mb-8 text-white">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Instant access</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Fully compliant with GDPR, CCPA & EU-DSGVO</span>
            </div>
          </div>
          
          <div className="flex justify-center">
            {!loading && (
              <>
                {user ? (
                  <Link href="/dashboard" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-12 rounded-xl transition-colors flex items-center justify-center text-lg">
                    <span className="text-2xl mr-3">🚀</span>
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/auth/signup" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-12 rounded-xl transition-colors flex items-center justify-center text-lg">
                    <span className="text-2xl mr-3">🚀</span>
                    Get Started Free
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">i</span>
                </div>
                <span className="text-xl font-bold">iSkala Enrich</span>
              </div>
              <p className="text-gray-400 mb-4">
                iSkala Enrich aggregates 20+ data sources to find and verify any mobile phone number and email address.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Knowledge Hub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Referral Program</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">DPA & CCPA</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 iSkala Enrich. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 