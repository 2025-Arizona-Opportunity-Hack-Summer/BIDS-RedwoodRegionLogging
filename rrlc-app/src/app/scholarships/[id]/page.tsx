"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiDollarSign, 
  FiUsers, 
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiShare2,
  FiCopy,
  FiMail
} from "react-icons/fi";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa";
import { getScholarshipById } from "@/services/scholarships";
import { checkExistingApplication } from "@/services/applications";
import { Scholarship } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicScholarshipContext } from "@/contexts/PublicScholarshipContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function ScholarshipDetailSkeleton() {
  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-white border-b-2 border-accent-dark p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 w-40 bg-gray-300 rounded animate-pulse mb-4" />
          <div className="h-10 w-3/4 bg-gray-300 rounded animate-pulse mb-2" />
          <div className="h-6 w-1/2 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          <div className="bg-white border-2 border-accent-dark rounded-lg p-6">
            <div className="h-40 bg-gray-300 rounded animate-pulse" />
          </div>
          <div className="bg-white border-2 border-accent-dark rounded-lg p-6">
            <div className="h-60 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  scholarshipName: string;
  scholarshipUrl: string;
}

function ShareModal({ isOpen, onClose, scholarshipName, scholarshipUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out this scholarship opportunity: ${scholarshipName}`;
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(scholarshipUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(scholarshipUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(scholarshipUrl)}`,
    email: `mailto:?subject=${encodeURIComponent(scholarshipName)}&body=${encodeURIComponent(shareText + '\n\n' + scholarshipUrl)}`
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scholarshipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-xl font-semibold mb-4">Share Scholarship</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
          >
            <FaFacebook className="text-blue-600" size={20} />
            <span>Facebook</span>
          </a>
          
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
          >
            <FaTwitter className="text-blue-400" size={20} />
            <span>Twitter</span>
          </a>
          
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
          >
            <FaLinkedin className="text-blue-700" size={20} />
            <span>LinkedIn</span>
          </a>
          
          <a
            href={shareLinks.email}
            className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
          >
            <FiMail className="text-gray-600" size={20} />
            <span>Email</span>
          </a>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">Or copy link:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={scholarshipUrl}
              readOnly
              className="flex-1 p-2 border rounded-lg text-sm bg-gray-50"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
            >
              {copied ? <FiCheckCircle /> : <FiCopy />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ScholarshipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { getScholarshipFromCache } = usePublicScholarshipContext();
  const scholarshipId = params.id as string;
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    const fetchScholarship = async () => {
      // First, check if we already have this scholarship in the context
      const cachedScholarship = getScholarshipFromCache(scholarshipId);
      if (cachedScholarship) {
        // Use cached data immediately
        setScholarship(cachedScholarship);
        setLoading(false);
        return;
      }

      // If not in cache, fetch from API
      setLoading(true);
      const { data, error } = await getScholarshipById(scholarshipId);
      
      if (error) {
        setError('Failed to load scholarship details');
        console.error('Error fetching scholarship:', error);
      } else if (data) {
        setScholarship(data);
      }
      
      setLoading(false);
    };

    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId, getScholarshipFromCache]);

  useEffect(() => {
    const checkApplication = async () => {
      if (!isAuthenticated() || !user?.email || !scholarship) return;
      
      setCheckingApplication(true);
      const { data } = await checkExistingApplication(scholarship.id, user.email);
      setHasApplied(!!data);
      setCheckingApplication(false);
    };

    if (scholarship) {
      checkApplication();
    }
  }, [scholarship, isAuthenticated, user]);

  const handleApplyClick = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    router.push(`/scholarships/${scholarshipId}/apply`);
  };

  // Only show loading skeleton if we're loading and have no scholarship data yet
  if (loading && !scholarship) {
    return <ScholarshipDetailSkeleton />;
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold text-primary">Scholarship Not Found</h1>
            <p className="text-primary-dark">
              {error || "The scholarship you're looking for doesn't exist or may have been removed."}
            </p>
            <Button
              onClick={() => router.push('/scholarships')}
              className="bg-primary text-white hover:bg-primary-light"
            >
              Browse Scholarships
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getDaysUntilDeadline = (deadline: string | null): number | null => {
    if (!deadline) return null;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Amount varies";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const daysLeft = getDaysUntilDeadline(scholarship.deadline);
  const isExpired = daysLeft === 0;
  const scholarshipUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-accent">
      {/* Header */}
      <div className="bg-white border-b-2 border-accent-dark p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/scholarships')}
            className="text-primary hover:bg-accent mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to All Scholarships
          </Button>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {scholarship.name}
              </h1>
              {scholarship.tags && scholarship.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {scholarship.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent text-primary-dark rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              onClick={() => setShareModalOpen(true)}
              className="text-primary hover:bg-accent"
            >
              <FiShare2 className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="grid gap-6">
          {/* Key Information Card */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <FiDollarSign className="text-secondary mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Award Amount</p>
                  <p className="text-xl font-semibold text-primary">
                    {formatCurrency(scholarship.amount)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FiCalendar className="text-secondary mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Application Deadline</p>
                  <p className="text-xl font-semibold text-primary">
                    {scholarship.deadline 
                      ? new Date(scholarship.deadline).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'No deadline'
                    }
                  </p>
                  {daysLeft !== null && (
                    <p className={`text-sm mt-1 ${
                      isExpired ? 'text-red-600' : 
                      daysLeft <= 7 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      <FiClock className="inline mr-1" size={14} />
                      {isExpired ? 'Deadline passed' : `${daysLeft} days left`}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <FiUsers className="text-secondary mt-1" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Application Status</p>
                  {checkingApplication ? (
                    <p className="text-gray-500">Checking...</p>
                  ) : hasApplied ? (
                    <p className="text-green-600 font-semibold">
                      <FiCheckCircle className="inline mr-1" />
                      Already Applied
                    </p>
                  ) : (
                    <p className="text-primary font-semibold">Accepting Applications</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Apply Button */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={handleApplyClick}
                disabled={isExpired || hasApplied}
                size="lg"
                className="bg-primary text-white hover:bg-primary-light disabled:opacity-50"
              >
                {hasApplied ? 'Already Applied' : 
                 isExpired ? 'Application Closed' : 
                 'Apply Now'}
              </Button>
            </div>
          </Card>

          {/* Description Card */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4 flex items-center">
              <FiFileText className="mr-2" />
              About This Scholarship
            </h2>
            
            <div className="prose max-w-none text-primary-dark">
              <p className="mb-4">{scholarship.description}</p>
              
              {scholarship.extended_description && (
                <div className="mt-6 whitespace-pre-wrap">
                  {scholarship.extended_description}
                </div>
              )}
            </div>
          </Card>

          {/* Requirements Card */}
          {scholarship.requirements && (
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Requirements
              </h2>
              
              <div className="prose max-w-none text-primary-dark whitespace-pre-wrap">
                {scholarship.requirements}
              </div>
            </Card>
          )}

          {/* Eligibility Criteria Card */}
          {scholarship.eligibility_criteria && scholarship.eligibility_criteria.length > 0 && (
            <Card className="bg-white border-2 border-accent-dark p-6">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Eligibility Criteria
              </h2>
              
              <ul className="space-y-2">
                {scholarship.eligibility_criteria.map((criteria: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <FiCheckCircle className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-primary-dark">{criteria}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Related Scholarships */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <h2 className="text-2xl font-semibold text-primary mb-4">
              More Opportunities
            </h2>
            
            <div className="text-center py-4">
              <Link href="/scholarships">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                  Browse All Scholarships
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
      
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        scholarshipName={scholarship.name}
        scholarshipUrl={scholarshipUrl}
      />
    </div>
  );
}