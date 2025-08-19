import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'crypto-pro-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Types for our database
export interface Profile {
  id: string
  name: string
  email: string
  roles: string // Campo roles conforme definido na tabela
}

export interface DailyQuote {
  id: string
  user_id: string
  quote: string
  date: string
  created_at: string
  updated_at: string
}

export interface UserQuoteView {
  id: string
  user_id: string
  quote_id: string
  viewed_at: string
}

// Day Trade System Types
export interface DaytradeSetup {
  id: string
  user_id: string
  market_mode: 'spot' | 'futures'
  box1_value: number
  box2_value: number
  box1_initial_fixed: number
  box2_initial_fixed: number
  created_at: string
  updated_at: string
}

export interface DaytradeCompoundGoals {
  id: string
  user_id: string
  cycle_number: number
  initial_investment: number
  return_percentage: number
  goals_data: any[] // Array com as metas dos 30 dias
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DaytradeCurrentCycle {
  id: string
  user_id: string
  current_cycle: number
  completed_cycles_history: any[]
  created_at: string
  updated_at: string
}

export interface DaytradeOperations {
  id: string
  user_id: string
  cycle_number: number
  day_number: number
  operation_type: 'profit' | 'loss' | 'pending'
  operation_value: number | null
  goal_value: number
  square_color: 'green' | 'orange' | 'red' | 'yellow' | 'transparent'
  is_goal_met: boolean
  operation_date: string
  created_at: string
  updated_at: string
}

export interface DaytradeStatistics {
  id: string
  user_id: string
  cycle_number: number
  total_operations: number
  successful_operations: number
  failed_operations: number
  total_profit: number
  total_loss: number
  net_result: number
  cycle_completed: boolean
  completion_date: string | null
  created_at: string
  updated_at: string
}

// Auth functions
export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    return { data, error }
  },

  // Sign up new user
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    
    // Se o registro for bem-sucedido, cria o perfil do usuário
    if (data.user) {
      await this.createProfile({
        id: data.user.id,
        name,
        email,
        roles: 'user' // Papel padrão para novos usuários
      })
    }
    
    return { data, error }
  },

  // Create user profile
  async createProfile(profile: Profile) {
    const { error } = await supabase
      .from('profile')
      .insert([profile])
    
    if (error) {
      console.error('Error creating profile:', error)
    }
    
    return { error }
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  // Get user profile with role
  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      // Vamos buscar o perfil do usuário diretamente usando match
      const { data, error } = await supabase
        .from('profile')
        .select('id, name, email, roles')
        .match({ id: userId })
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Se não encontrou o perfil, vamos criar um com base nos dados de autenticação
      if (!data) {
        // Buscar dados do usuário autenticado
        const { data: authUser } = await supabase.auth.getUser();
        
        if (authUser && authUser.user) {
          const newProfile: Profile = {
            id: userId,
            name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'Usuário',
            email: authUser.user.email || '',
            roles: 'user'
          };
          
          // Tentar inserir o perfil
          try {
            const { error: insertError } = await supabase
              .from('profile')
              .insert([newProfile]);
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
              return null;
            }
            
            return newProfile;
          } catch (insertError) {
            console.error('Exception creating profile:', insertError);
            return null;
          }
        }
      }

      return data;
    } catch (error) {
      return null;
    }
  },

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId)
    // Verifica se o usuário tem roles de admin
    return profile?.roles === 'admin'
  },

  // Listen to auth changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
  
  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }
}

// Daily Quote functions
export const dailyQuoteService = {
  // Get today's quote from database for specific user
  async getTodaysQuote(userId: string): Promise<DailyQuote | null> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      const { data, error } = await supabase
        .from('daily_quotes')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        return null;
      }

      // Se encontrou uma frase, verificar se é de hoje
      if (data) {
        const quoteDate = data.date;
        if (quoteDate === today) {
          // Frase é de hoje, retornar
          return data;
        } else {
          // Frase é de outro dia, considerar como não existente (será substituída)
          return null;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  // Save new quote to database for specific user (replaces old quote)
  async saveTodaysQuote(userId: string, quote: string): Promise<DailyQuote | null> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

      // Usar a função upsert_daily_quote que substitui a frase anterior
      const { data, error } = await supabase
        .rpc('upsert_daily_quote', {
          p_user_id: userId,
          p_quote: quote,
          p_date: today
        });

      if (error) {
        return null;
      }

      // A função retorna um array, pegar o primeiro item
      const result = data && data.length > 0 ? data[0] : null;

      if (result) {
        return {
          id: result.quote_id,
          user_id: result.quote_user_id,
          quote: result.quote_text,
          date: result.quote_date,
          created_at: result.quote_created_at,
          updated_at: result.quote_updated_at
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  // Check if user has viewed today's quote
  async hasUserViewedTodaysQuote(userId: string): Promise<boolean> {
    try {
      // Get today's quote for this user first
      const todaysQuote = await this.getTodaysQuote(userId);
      if (!todaysQuote) return false;

      const { data, error } = await supabase
        .from('user_quote_views')
        .select('id')
        .eq('user_id', userId)
        .eq('quote_id', todaysQuote.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  },

  // Mark quote as viewed by user
  async markQuoteAsViewed(userId: string, quoteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_quote_views')
        .insert([
          {
            user_id: userId,
            quote_id: quoteId,
          }
        ]);

      if (error) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  // Get notification count for user (1 if new quote available, 0 if already viewed)
  async getNotificationCount(userId: string): Promise<number> {
    try {
      const hasViewed = await this.hasUserViewedTodaysQuote(userId);
      const todaysQuote = await this.getTodaysQuote(userId);

      // If there's a quote for today and user hasn't viewed it, show notification
      if (todaysQuote && !hasViewed) {
        return 1;
      }

      return 0;
    } catch (error) {
      return 0;
    }
  }
}

// Day Trade System Service
export class DaytradeService {
  // Função para obter o user_id atual ou usar mock para desenvolvimento
  private static async getUserId(): Promise<string> {
    try {
      const user = await authService.getCurrentUser()
      const userId = user?.id || '00000000-0000-0000-0000-000000000000' // Mock ID para desenvolvimento

      console.log('👤 User ID obtido:', userId)

      // Verificar se o usuário está autenticado
      if (!user && userId === '00000000-0000-0000-0000-000000000000') {
        console.log('⚠️ Usando mock ID para desenvolvimento')
      }

      return userId
    } catch (error) {
      console.error('❌ Erro ao obter user ID:', error)
      return '00000000-0000-0000-0000-000000000000' // Fallback para desenvolvimento
    }
  }

  // Setup inicial dos caixas
  static async saveSetup(data: {
    marketMode: 'spot' | 'futures'
    box1Value: number
    box2Value: number
    box1InitialFixed: number
    box2InitialFixed: number
  }) {
    const userId = await this.getUserId()

    const { data: result, error } = await supabase
      .from('daytrade_setup')
      .upsert({
        user_id: userId,
        market_mode: data.marketMode,
        box1_value: data.box1Value,
        box2_value: data.box2Value,
        box1_initial_fixed: data.box1InitialFixed,
        box2_initial_fixed: data.box2InitialFixed,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
    return result
  }

  // Atualizar valores atuais dos caixas (sem alterar os valores iniciais fixos)
  static async updateCurrentBoxValues(data: {
    box1Value: number
    box2Value: number
  }) {
    const userId = await this.getUserId()

    const { data: result, error } = await supabase
      .from('daytrade_setup')
      .update({
        box1_value: data.box1Value,
        box2_value: data.box2Value,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
    return result
  }

  // Carregar setup existente
  static async loadSetup(): Promise<DaytradeSetup | null> {
    const userId = await this.getUserId()

    const { data, error } = await supabase
      .from('daytrade_setup')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    return data
  }

  // Salvar metas de juros compostos
  static async saveCompoundGoals(data: {
    cycleNumber: number
    initialInvestment: number
    returnPercentage: number
    goalsData: number[]
  }) {
    const userId = await this.getUserId()

    // Primeiro, desativar metas anteriores
    await supabase
      .from('daytrade_compound_goals')
      .update({ is_active: false })
      .eq('user_id', userId)

    const { data: result, error } = await supabase
      .from('daytrade_compound_goals')
      .insert({
        user_id: userId,
        cycle_number: data.cycleNumber,
        initial_investment: data.initialInvestment,
        return_percentage: data.returnPercentage,
        goals_data: data.goalsData,
        is_active: true
      })

    if (error) throw error
    return result
  }

  // Carregar metas ativas
  static async loadActiveGoals(): Promise<DaytradeCompoundGoals | null> {
    try {
      const userId = await this.getUserId()
      console.log('🎯 Carregando metas ativas para usuário:', userId)

      const { data, error } = await supabase
        .from('daytrade_compound_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.log('⚠️ Erro ao carregar metas ativas:', error)
        if (error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('❌ Erro crítico ao carregar metas:', error)
          throw error
        }
        return null
      }

      console.log('✅ Metas ativas carregadas:', data)
      return data
    } catch (error) {
      console.error('❌ Erro na função loadActiveGoals:', error)
      throw error
    }
  }

  // Carregar metas específicas de um ciclo
  static async loadGoalsForCycle(cycleNumber: number): Promise<DaytradeCompoundGoals | null> {
    try {
      const userId = await this.getUserId()
      console.log(`🎯 Carregando metas do ciclo ${cycleNumber} para usuário:`, userId)

      // Primeiro, tentar carregar metas específicas do ciclo
      const { data: cycleGoals, error: cycleError } = await supabase
        .from('daytrade_compound_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('cycle_number', cycleNumber)
        .eq('is_active', true)
        .single()

      if (cycleGoals) {
        console.log(`✅ Metas do ciclo ${cycleNumber} encontradas:`, cycleGoals)
        return cycleGoals
      }

      console.log(`⚠️ Metas específicas do ciclo ${cycleNumber} não encontradas, usando fallback`)

      // Fallback: carregar meta ativa mais recente
      const fallbackGoals = await this.loadActiveGoals()
      if (fallbackGoals) {
        console.log(`⚠️ INCONSISTÊNCIA: Ciclo atual é ${cycleNumber}, mas metas carregadas são do ciclo ${fallbackGoals.cycle_number}`)
      }

      return fallbackGoals
    } catch (error) {
      console.error(`❌ Erro na função loadGoalsForCycle(${cycleNumber}):`, error)
      throw error
    }
  }

  // Salvar/atualizar ciclo atual
  static async saveCurrentCycle(data: {
    currentCycle: number
    completedCyclesHistory: any[]
  }) {
    const userId = await this.getUserId()

    const { data: result, error } = await supabase
      .from('daytrade_current_cycle')
      .upsert({
        user_id: userId,
        current_cycle: data.currentCycle,
        completed_cycles_history: data.completedCyclesHistory,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) throw error
    return result
  }

  // Carregar ciclo atual
  static async loadCurrentCycle(): Promise<DaytradeCurrentCycle | null> {
    try {
      const userId = await this.getUserId()
      console.log('🔍 Carregando ciclo atual para usuário:', userId)

      const { data, error } = await supabase
        .from('daytrade_current_cycle')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.log('⚠️ Erro ao carregar ciclo atual:', error)
        if (error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('❌ Erro crítico ao carregar ciclo:', error)
          throw error
        }
        return null
      }

      console.log('✅ Ciclo atual carregado:', data)
      return data
    } catch (error) {
      console.error('❌ Erro na função loadCurrentCycle:', error)
      throw error
    }
  }

  // Salvar operação
  static async saveOperation(data: {
    cycleNumber: number
    dayNumber: number
    operationType: 'profit' | 'loss' | 'pending'
    operationValue: number | null
    goalValue: number
    squareColor: 'green' | 'orange' | 'red' | 'yellow' | 'transparent'
    isGoalMet: boolean
  }) {
    const userId = await this.getUserId()

    const { data: result, error } = await supabase
      .from('daytrade_operations')
      .upsert({
        user_id: userId,
        cycle_number: data.cycleNumber,
        day_number: data.dayNumber,
        operation_type: data.operationType,
        operation_value: data.operationValue,
        goal_value: data.goalValue,
        square_color: data.squareColor,
        is_goal_met: data.isGoalMet,
        operation_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,cycle_number,day_number'
      })

    if (error) throw error
    return result
  }

  // Carregar operações do ciclo atual
  static async loadOperations(cycleNumber: number): Promise<DaytradeOperations[]> {
    const userId = await this.getUserId()

    const { data, error } = await supabase
      .from('daytrade_operations')
      .select('*')
      .eq('user_id', userId)
      .eq('cycle_number', cycleNumber)
      .order('day_number', { ascending: true })

    if (error) throw error
    return data || []
  }

  // Salvar/atualizar estatísticas
  static async saveStatistics(data: {
    cycleNumber: number
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    totalProfit: number
    totalLoss: number
    netResult: number
    cycleCompleted: boolean
    completionDate?: string
  }) {
    const userId = await this.getUserId()

    const { data: result, error } = await supabase
      .from('daytrade_statistics')
      .upsert({
        user_id: userId,
        cycle_number: data.cycleNumber,
        total_operations: data.totalOperations,
        successful_operations: data.successfulOperations,
        failed_operations: data.failedOperations,
        total_profit: data.totalProfit,
        total_loss: data.totalLoss,
        net_result: data.netResult,
        cycle_completed: data.cycleCompleted,
        completion_date: data.completionDate || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,cycle_number'
      })

    if (error) throw error
    return result
  }

  // Carregar estatísticas
  static async loadStatistics(cycleNumber?: number): Promise<DaytradeStatistics[]> {
    const userId = await this.getUserId()

    let query = supabase
      .from('daytrade_statistics')
      .select('*')
      .eq('user_id', userId)

    if (cycleNumber) {
      query = query.eq('cycle_number', cycleNumber)
    }

    const { data, error } = await query.order('cycle_number', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Resetar todos os dados do usuário
  static async resetAllData() {
    const userId = await this.getUserId()

    const tables = [
      'daytrade_setup',
      'daytrade_compound_goals',
      'daytrade_current_cycle',
      'daytrade_operations',
      'daytrade_statistics'
    ]

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    }
  }
}