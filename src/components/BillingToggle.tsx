'use client';

interface BillingToggleProps {
  isAnnual: boolean;
  onToggle: () => void;
}

export default function BillingToggle({ isAnnual, onToggle }: BillingToggleProps) {
  return (
    <div className="pricing-toggle">
      <span className={!isAnnual ? 'active' : ''}>Monthly</span>
      <button
        type="button"
        className={`toggle-switch${isAnnual ? ' annual' : ''}`}
        onClick={onToggle}
        aria-label="Toggle billing period"
        aria-pressed={isAnnual}
      />
      <span className={isAnnual ? 'active' : ''}>Annual</span>
      <span className="save-badge">Save 20%</span>
    </div>
  );
}
