import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeTab, setActiveTab] = useState('inbox'); // Default is Sales Inbox!
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [currentProposal, setCurrentProposal] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emails, setEmails] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadEmails = async () => {
    try {
      const data = await api.getEmails();
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (e) {
      console.warn('Error loading emails:', e);
    }
  };

  const loadProposals = async () => {
    try {
      const data = await api.getProposals();
      setProposals(data);
    } catch (e) {
      console.warn('Error loading proposals:', e);
    }
  };

  const loadFollowUps = async () => {
    try {
      const data = await api.getFollowUps();
      setFollowUps(data);
    } catch (e) {
      console.warn('Error loading follow-ups:', e);
    }
  };

  useEffect(() => {
    loadEmails();
    loadProposals();
    loadFollowUps();
  }, []);

  const openEditorWithProposal = (proposal) => {
    setCurrentProposal(proposal);
    setActiveTab('editor');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedEmail,
        setSelectedEmail,
        currentProposal,
        setCurrentProposal,
        isAnalyzing,
        setIsAnalyzing,
        emails,
        setEmails,
        proposals,
        setProposals,
        followUps,
        setFollowUps,
        loadEmails,
        loadProposals,
        loadFollowUps,
        openEditorWithProposal,
        toast,
        showToast,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
