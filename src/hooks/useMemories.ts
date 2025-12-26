import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Memory } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type { Memory } from '@/integrations/supabase/types';

export const MEMORY_CATEGORIES = [
  { value: 'love', label: '❤️ Love', emoji: '❤️' },
  { value: 'travel', label: '✈️ Travel', emoji: '✈️' },
  { value: 'food', label: '🍕 Food', emoji: '🍕' },
  { value: 'friendship', label: '👫 Friendship', emoji: '👫' },
  { value: 'family', label: '👨👩👧 Family', emoji: '👨👩👧' },
  { value: 'adventure', label: '🏔️ Adventure', emoji: '🏔️' },
  { value: 'memory', label: '💭 Memory', emoji: '💭' },
  { value: 'other', label: '✨ Other', emoji: '✨' },
];

export const useMemories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMemories = async () => {
    if (!user) {
      setMemories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });
      
      console.log('Fetched memories:', { data, error });
      
      if (error) throw error;
      
      setMemories(data || []);
    } catch (error: any) {
      console.error('Error fetching memories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load memories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createMemory = async (memory: Omit<Memory, 'id' | 'user_id' | 'updated_at'>) => {
    if (!user) return null;

    try {
      console.log('Creating memory:', memory, 'User:', user.id);
      
      const { data, error } = await supabase
        .from('memories')
        .insert({
          ...memory,
          user_id: user.id
        })
        .select('*')
        .single();

      console.log('Memory creation result:', { data, error });

      if (error) throw error;
      
      setMemories(prev => [data!, ...prev]);
      toast({
        title: 'Memory created',
        description: 'Your memory has been saved to the map'
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating memory:', error);
      toast({
        title: 'Error',
        description: `Failed to create memory: ${error.message}`,
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateMemory = async (id: string, updates: Partial<Memory>) => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          profiles:user_id (
            username,
            display_name
          )
        `)
        .single();

      if (error) throw error;
      
      setMemories(prev => prev.map(m => m.id === id ? data! : m));
      toast({
        title: 'Memory updated',
        description: 'Your changes have been saved'
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update memory',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setMemories(prev => prev.filter(m => m.id !== id));
      toast({
        title: 'Memory deleted',
        description: 'Your memory has been removed'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting memory:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete memory',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [user]);

  return {
    memories,
    loading,
    createMemory,
    updateMemory,
    deleteMemory,
    refetch: fetchMemories
  };
};