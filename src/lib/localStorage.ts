// Local storage client to replace Supabase functionality
export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  created_at: string;
}

export interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  color: string;
  is_public: boolean;
  photo_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
  username?: string | null;
  display_name?: string | null;
}

class LocalStorageClient {
  private users: User[] = [];
  private memories: Memory[] = [];
  private currentSession: Session | null = null;
  private authListeners: ((session: Session | null) => void)[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    const usersData = localStorage.getItem('amou_users');
    const memoriesData = localStorage.getItem('amou_memories');
    const sessionData = localStorage.getItem('amou_session');

    if (usersData) this.users = JSON.parse(usersData);
    if (memoriesData) this.memories = JSON.parse(memoriesData);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (session.expires_at > Date.now()) {
        this.currentSession = session;
      } else {
        localStorage.removeItem('amou_session');
      }
    }
  }

  private saveData() {
    localStorage.setItem('amou_users', JSON.stringify(this.users));
    localStorage.setItem('amou_memories', JSON.stringify(this.memories));
    if (this.currentSession) {
      localStorage.setItem('amou_session', JSON.stringify(this.currentSession));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private notifyAuthListeners() {
    this.authListeners.forEach(listener => listener(this.currentSession));
  }

  // Auth methods
  async signUp(email: string, password: string, username?: string): Promise<{ error: Error | null }> {
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      return { error: new Error('User already exists') };
    }

    const user: User = {
      id: this.generateId(),
      email,
      username: username || email.split('@')[0],
      display_name: username || email.split('@')[0],
      created_at: new Date().toISOString()
    };

    this.users.push(user);
    
    const session: Session = {
      user,
      access_token: this.generateId(),
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.currentSession = session;
    this.saveData();
    this.notifyAuthListeners();

    return { error: null };
  }

  async signIn(email: string, password: string): Promise<{ error: Error | null }> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return { error: new Error('Invalid credentials') };
    }

    const session: Session = {
      user,
      access_token: this.generateId(),
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.currentSession = session;
    this.saveData();
    this.notifyAuthListeners();

    return { error: null };
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
    localStorage.removeItem('amou_session');
    this.notifyAuthListeners();
  }

  getSession(): { data: { session: Session | null } } {
    return { data: { session: this.currentSession } };
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const listener = (session: Session | null) => callback('SIGNED_IN', session);
    this.authListeners.push(listener);
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = this.authListeners.indexOf(listener);
            if (index > -1) this.authListeners.splice(index, 1);
          }
        }
      }
    };
  }

  // Memory methods
  async getMemories(): Promise<{ data: Memory[] | null; error: Error | null }> {
    const memoriesWithProfiles = this.memories.map(memory => {
      const user = this.users.find(u => u.id === memory.user_id);
      return {
        ...memory,
        username: user?.username || null,
        display_name: user?.display_name || null
      };
    });

    return { data: memoriesWithProfiles, error: null };
  }

  async createMemory(memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Memory | null; error: Error | null }> {
    const newMemory: Memory = {
      ...memory,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.memories.unshift(newMemory);
    this.saveData();

    const user = this.users.find(u => u.id === memory.user_id);
    const memoryWithProfile = {
      ...newMemory,
      username: user?.username || null,
      display_name: user?.display_name || null
    };

    return { data: memoryWithProfile, error: null };
  }

  async updateMemory(id: string, updates: Partial<Memory>): Promise<{ data: Memory | null; error: Error | null }> {
    const index = this.memories.findIndex(m => m.id === id);
    if (index === -1) {
      return { data: null, error: new Error('Memory not found') };
    }

    this.memories[index] = {
      ...this.memories[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.saveData();

    const user = this.users.find(u => u.id === this.memories[index].user_id);
    const memoryWithProfile = {
      ...this.memories[index],
      username: user?.username || null,
      display_name: user?.display_name || null
    };

    return { data: memoryWithProfile, error: null };
  }

  async deleteMemory(id: string): Promise<{ error: Error | null }> {
    const index = this.memories.findIndex(m => m.id === id);
    if (index === -1) {
      return { error: new Error('Memory not found') };
    }

    this.memories.splice(index, 1);
    this.saveData();

    return { error: null };
  }
}

export const localClient = new LocalStorageClient();