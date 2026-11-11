import type { GameView } from '../types/game';

const gameRouteDefinitions = [
  { path: '/game/practice', name: 'practice-market', view: 'market' },
  { path: '/game/practice/companies', name: 'practice-companies', view: 'companies' },
  { path: '/game/practice/portfolio', name: 'practice-portfolio', view: 'portfolio' },
  { path: '/game/practice/stocks/:code/order', name: 'practice-order', view: 'orders' },
  { path: '/game/practice/stocks/:code', name: 'practice-stock', view: 'chart' },
] as const satisfies readonly { path: string; name: string; view: GameView }[];

export const gameRouteNames = Object.fromEntries(gameRouteDefinitions.map(({ view, name }) => [view, name])) as Record<GameView, string>;
export const gameRouteViews = Object.fromEntries(gameRouteDefinitions.map(({ name, view }) => [name, view])) as Record<string, GameView>;
export { gameRouteDefinitions };