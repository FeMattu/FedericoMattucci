import React, { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import getIcon from '@/lib/IconMap';
import { useTranslation } from '@/lib/translation';
import { useUserData } from '@/lib/utils';

type TabType = 'overview' | 'social' | 'education' | 'skills' | 'hobbies' | 'experience';

export default function UserInfo() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const userData = useUserData();
  const t = useTranslation();

  // Loading state
  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[var(--card-bg)] rounded-lg shadow-lg p-6 text-center">
          <div className="animate-pulse">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">{t('loading.user-info')}</p>
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

  // Helper function to extract username from social URLs
  const extractUsername = (url: string) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/')[1] || urlObj.hostname;
    } catch {
      return url;
    }
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
                <span className="text-[var(--text-secondary)]">federico-mattucci.vercel.app</span>
              </div>
              <div className="flex items-center space-x-3">
                {getIcon('email', 20, 'text-[var(--button-bg)]')}
                <span className="text-[var(--text-secondary)]">{userData.contacts.email.personal}</span>
              </div>
              <div className="flex items-center space-x-3">
                {getIcon('phone', 20, 'text-[var(--button-bg)]')}
                <span className="text-[var(--text-secondary)]">{userData.contacts.phone.number} ({userData.contacts.phone.type})</span>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('contatti.social')}</h3>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(userData.social).filter(([, url]) => url).map(([platform, url]) => (
                <div key={platform} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                  <div className="flex items-center space-x-3">
                    {getIcon(platform === 'x-twitter' ? 'x-twitter' : platform, 20, 'text-[var(--button-bg)]')}
                    <span className="text-[var(--text-primary)] capitalize">{t(`contatti.social.${platform}`)}</span>
                  </div>
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--text-secondary)] hover:text-[var(--button-bg)] transition-colors"
                  >
                    {extractUsername(url)}
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
                    <p className="text-sm text-[var(--text-secondary)]">{study.istitution}</p>
                    <p className="text-sm text-[var(--text-secondary)] opacity-75">
                      {study["start-date"].month} {study["start-date"].year} - {study["end-date"].present ? t('date.present') : `${study["end-date"].month} ${study["end-date"].year}`}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{study.description}</p>
                    <p className="text-sm font-medium text-[var(--button-bg)] mt-1">{study.grade}</p>
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
                
                {/* Front-end skills */}
                {skillCategory["front-end"] && (
                  <div className="mb-4">
                    <h5 className="font-medium text-[var(--text-primary)] mb-2">{skillCategory["front-end"].title}</h5>
                    <div className="flex flex-wrap gap-2">
                      {skillCategory["front-end"].list.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-[var(--button-bg)] text-[var(--button-text)] rounded-full text-sm"
                        >
                          {skill.name} ({skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back-end skills */}
                {skillCategory["back-end"] && (
                  <div className="mb-4">
                    <h5 className="font-medium text-[var(--text-primary)] mb-2">{skillCategory["back-end"].title}</h5>
                    <div className="flex flex-wrap gap-2">
                      {skillCategory["back-end"].list.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-[var(--button-bg)] text-[var(--button-text)] rounded-full text-sm"
                        >
                          {skill.name} ({skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile skills */}
                {skillCategory.mobile && (
                  <div className="mb-4">
                    <h5 className="font-medium text-[var(--text-primary)] mb-2">{skillCategory.mobile.title}</h5>
                    <div className="flex flex-wrap gap-2">
                      {skillCategory.mobile.list.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-[var(--button-bg)] text-[var(--button-text)] rounded-full text-sm"
                        >
                          {skill.name} ({skill.level})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other skills */}
                {skillCategory.list && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {skillCategory.list.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-[var(--button-bg)] text-[var(--button-text)] rounded-full text-sm"
                        >
                          {skill.name} {skill.level && `(${skill.level})`}
                        </span>
                      ))}
                    </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["Tecnologie", "Fotografia", "Viaggi", "Cucina", "Sport"].map((hobby, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]"
                >
                  {getIcon('heart', 16, 'text-[var(--button-bg)]')}
                  <span className="text-[var(--text-primary)] text-sm">{hobby}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{t('job')}</h3>
            {userData.jobs.map((job, index) => (
              <div key={index} className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-color)]">
                <div className="flex items-start space-x-3">
                  {getIcon('briefcase', 20, 'text-[var(--button-bg)] mt-1')}
                  <div className="flex-1">
                    <h4 className="font-semibold text-[var(--text-primary)]">{job.title}</h4>
                    <p className="text-[var(--text-secondary)]">{job.company}</p>
                    <p className="text-sm text-[var(--text-secondary)] opacity-75 mb-2">
                      {job.type} • {job["start-date"].month} {job["start-date"].year} - {job["end-date"].present ? t('date.present') : `${job["end-date"].month} ${job["end-date"].year}`}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">{job.description}</p>
                    <p className="text-xs text-[var(--text-secondary)] opacity-75 mt-1">
                      {job.location.city}, {job.location.country}
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
                src={session?.user?.image || `/images/${userData.image}`} 
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
            <p className="text-[var(--text-secondary)] mb-2">{t('profile.user-info')}</p>
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
              <span>{t('auth.sign-out')}</span>
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