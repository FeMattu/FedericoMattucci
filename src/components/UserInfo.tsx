import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import getIcon from '@/lib/IconMap';
import { useTranslation } from '@/hooks/useTranslationsSafe';
import { useUserData } from '@/hooks/useUserData';
import { useParams } from 'next/navigation';

type TabType = 'overview' | 'social' | 'education' | 'skills' | 'hobbies' | 'experience';

export default function UserInfo() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const params = useParams();
  const locale = params.locale as string || "it";
  const { data: userData, loading } = useUserData(locale);
  const t = useTranslation();

  // Loading state
  if (loading || !userData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[var(--card-bg)] rounded-lg shadow-lg p-6 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">{t('loading.userInfo')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as TabType, label: t('profile.tabs.overview'), icon: 'user' },
    { id: 'social' as TabType, label: t('profile.tabs.social'), icon: 'share' },
    { id: 'education' as TabType, label: t('profile.tabs.education'), icon: 'graduation' },
    { id: 'skills' as TabType, label: t('profile.tabs.skills'), icon: 'computer' },
    { id: 'hobbies' as TabType, label: t('profile.tabs.hobbies'), icon: 'heart' },
    { id: 'experience' as TabType, label: t('profile.tabs.experience'), icon: 'briefcase' }
  ];

  // Helper function to recursively render skills
  const renderSkill = (skill: any, depth: number = 0): React.ReactNode => {
    if (skill.level && !skill.list) {
      // It's a leaf skill with a level
      return (
        <span className="px-3 py-1 bg-[var(--button-bg)] text-[var(--button-text)] rounded-full text-sm">
          {skill.name} ({skill.level})
        </span>
      );
    }

    if (skill.list) {
      // It's a category with subcategories
      return (
        <div className={depth > 0 ? "ml-4" : ""}>
          <h5 className={`font-medium text-[var(--text-primary)] mb-2 ${depth > 0 ? "text-sm" : ""}`}>
            {skill.name}
          </h5>
          <div className={`flex flex-wrap gap-2 ${depth > 0 ? "mb-2" : "mb-4"}`}>
            {skill.list.map((subSkill: any, index: number) => (
              <div key={index}>
                {renderSkill(subSkill, depth + 1)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t('profile.bio')}</h3>
              <p className="text-[var(--text-secondary)]">{userData.bio}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                {getIcon('location', 20, 'text-[var(--button-bg)]')}
                <span className="text-[var(--text-secondary)]">{userData.location.city}, {userData.location.country}</span>
              </div>
              <div className="flex items-center space-x-3">
                {getIcon('earth', 20, 'text-[var(--button-bg)]')}
                <a href={userData.contacts.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--button-bg)] transition-colors">
                  {userData.contacts.websiteUrl}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                {getIcon('email', 20, 'text-[var(--button-bg)]')}
                <span className="text-[var(--text-secondary)]">{userData.contacts.email[0]?.address || ""}</span>
              </div>
              <div className="flex items-center space-x-3">
                {getIcon('phone', 20, 'text-[var(--button-bg)]')}
                <span className="text-[var(--text-secondary)]">{userData.contacts.phone[0]?.number || ""} ({userData.contacts.phone[0]?.type || ""})</span>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('contatti.social')}</h3>
            <div className="grid grid-cols-1 gap-3">
              {userData.contacts.social.map((social, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="flex items-center space-x-3">
                    {getIcon(social.network.toLowerCase(), 20, 'text-[var(--button-bg)]')}
                    <span className="text-[var(--text-primary)] capitalize">{social.network}</span>
                  </div>
                  <a 
                    href={social.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--text-secondary)] hover:text-[var(--button-bg)] transition-colors max-w-[200px] truncate whitespace-nowrap overflow-hidden"
                    >
                    {social.link}
                  </a>
                </div>
              ))}
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('education')}</h3>
            {userData.education.studies.map((study, index) => (
              <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3">
                  {getIcon('graduation', 20, 'text-[var(--button-bg)] mt-1')}
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)]">{study.title}</h4>
                    <p className="text-[var(--text-secondary)]">{study.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{study.institution}</p>
                    <p className="text-sm text-[var(--text-secondary)] opacity-75">
                      {study.startDate.month} {study.startDate.year} - {study.endDate.present ? t('date.present') : `${study.endDate.month} ${study.endDate.year}`}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{study.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('skills')}</h3>
            {userData.skills.map((skillCategory, categoryIndex) => (
              <div key={categoryIndex} className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <h4 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center">
                  {getIcon('computer', 18, 'text-[var(--button-bg)] mr-2')}
                  {skillCategory.name}
                </h4>
                {skillCategory.list && (
                  <div className="space-y-2">
                    {skillCategory.list.map((skill, skillIndex) => (
                      <div key={skillIndex}>
                        {renderSkill(skill)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 'hobbies':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('hobby')}</h3>
            <p className="text-[var(--text-secondary)] mb-4">{userData.hobbies.description}</p>
            <div className="grid grid-cols-1 gap-3">
              {userData.hobbies.list.map((hobby, index) => (
                <div
                  key={index}
                  className="p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
                >
                  <div className="flex items-start space-x-2">
                    {getIcon('heart', 16, 'w-4 h-4 shrink-0 text-[var(--button-bg)] mt-1')}
                    <div>
                      <h4 className="text-[var(--text-primary)] font-medium">{hobby.name}</h4>
                      <p className="text-[var(--text-secondary)] text-sm mt-1">{hobby.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('experience')}</h3>
            {userData.experiences.map((experience, index) => (
              <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3">
                  {getIcon('briefcase', 20, 'text-[var(--button-bg)] mt-1')}
                  <div className="flex-1">
                    <h4 className="font-semibold text-[var(--text-primary)]">{experience.title}</h4>
                    <p className="text-[var(--text-secondary)]">{experience.company}</p>
                    <p className="text-sm text-[var(--text-secondary)] opacity-75 mb-2">
                      {experience.type} • {experience.startDate.month} {experience.startDate.year} - {experience.endDate.present ? t('date.present') : `${experience.endDate.month} ${experience.endDate.year}`}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{experience.description}</p>
                    <p className="text-xs text-[var(--text-secondary)] opacity-75 mt-1">
                      {experience.location.city}, {experience.location.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header del profilo */}
      <div className="bg-[var(--card-bg)] rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-[var(--button-bg)]">
              <AvatarImage 
                src={session?.user?.image || `/images/${userData.profileImageUrl}`} 
                alt={userData.fullname} 
              />
              <AvatarFallback className="bg-[var(--button-bg)] text-[var(--button-text)] text-xl">
                {userData.fullname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[var(--card-bg)]"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              {userData.fullname}
            </h1>
            <p className="text-[var(--text-secondary)] mb-2">{t('profile.userInfo')}</p>
            <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-[var(--text-secondary)]">
              {getIcon('location', 16, 'text-[var(--button-bg)]')}
              <span>{userData.location.city}, {userData.location.country}</span>
            </div>
          </div>
          
          <div className="flex flex-col justify-center items-center space-y-2">
            <Button
              onClick={() => signOut()}
              className="flex items-center space-x-2 bg-[var(--button-bg)] hover:bg-[var(--button-hover)] text-[var(--button-text)]"
            >
              {getIcon('sign-out', 16)}
              <span>{t('auth.signOut')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs di navigazione */}
      <div className="bg-[var(--card-bg)] rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap justify-around border-b border-[var(--border-color)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'text-[var(--button-bg)] border-b-2 border-[var(--button-bg)] bg-[var(--bg-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
              }`}
            >
              {getIcon(tab.icon, 16)}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenuto delle tabs */}
      <div className="bg-[var(--card-bg)] rounded-lg shadow-lg p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}