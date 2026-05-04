import '@angular/localize/init';

import {
  ACT_THRESHOLD,
  STAY_THRESHOLD,
  classifyLean,
  confidenceLabel,
} from './balance.util';

describe('classifyLean', () => {
  it('returns null when total is zero', () => {
    expect(classifyLean({ q1: 0, q2: 0, q3: 0, q4: 0 })).toBeNull();
  });

  it('returns "act" when act share is above ACT_THRESHOLD', () => {
    expect(classifyLean({ q1: 7, q2: 1, q3: 1, q4: 1 })).toBe('act');
  });

  it('returns "stay" when act share is below STAY_THRESHOLD', () => {
    expect(classifyLean({ q1: 1, q2: 7, q3: 1, q4: 1 })).toBe('stay');
  });

  it('returns "even" when act share sits between thresholds', () => {
    expect(classifyLean({ q1: 1, q2: 1, q3: 1, q4: 1 })).toBe('even');
  });

  it('treats exactly ACT_THRESHOLD as even (boundary is exclusive)', () => {
    expect(ACT_THRESHOLD).toBe(58);
    expect(classifyLean({ q1: 29, q2: 21, q3: 0, q4: 0 })).toBe('even');
  });

  it('treats exactly STAY_THRESHOLD as even (boundary is exclusive)', () => {
    expect(STAY_THRESHOLD).toBe(42);
    expect(classifyLean({ q1: 21, q2: 29, q3: 0, q4: 0 })).toBe('even');
  });

  it('groups q1 + q4 as the act side', () => {
    expect(classifyLean({ q1: 5, q2: 0, q3: 0, q4: 5 })).toBe('act');
  });

  it('groups q2 + q3 as the stay side', () => {
    expect(classifyLean({ q1: 0, q2: 5, q3: 5, q4: 0 })).toBe('stay');
  });
});

describe('confidenceLabel', () => {
  it('returns "Very unsure" below 20', () => {
    expect(confidenceLabel(0)).toBe('Very unsure');
    expect(confidenceLabel(19)).toBe('Very unsure');
  });

  it('returns "Leaning" between 20 and 39', () => {
    expect(confidenceLabel(20)).toBe('Leaning');
    expect(confidenceLabel(39)).toBe('Leaning');
  });

  it('returns "On the fence" between 40 and 59', () => {
    expect(confidenceLabel(40)).toBe('On the fence');
    expect(confidenceLabel(59)).toBe('On the fence');
  });

  it('returns "Fairly sure" between 60 and 79', () => {
    expect(confidenceLabel(60)).toBe('Fairly sure');
    expect(confidenceLabel(79)).toBe('Fairly sure');
  });

  it('returns "Confident" at 80 and above', () => {
    expect(confidenceLabel(80)).toBe('Confident');
    expect(confidenceLabel(100)).toBe('Confident');
  });
});
