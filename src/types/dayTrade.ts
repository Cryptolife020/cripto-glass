
export interface DayTradeRecord {
  id: string;
  date: string;
  box1: number;
  box2: number;
  marketMode: 'spot' | 'futures';
  observation?: string;
}

export interface CompoundInterestGoal {
  day: number;
  investment: number;
  returnPercentage: number;
  goal: number;
  accumulated: number;
}

export interface DayOperation {
  day: number;
  status: 'pending' | 'profit' | 'loss' | 'goal';
  value?: number;
  isGoalMet?: boolean;
}

export interface CycleData {
  currentCycle: number;
  completedDays: number;
  operations: DayOperation[];
  box1Balance: number;
  box2Balance: number;
  totalInvested: number;
  netProfit: number;
}
