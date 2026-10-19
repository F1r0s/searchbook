import React, { useState, useEffect, useRef } from 'react';
import { CpaOffer, LockerService } from '../services/locker-service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
  bookId?: string;
  bookTitle?: string;
  targetActionName?: string; // e.g. "Full Online Reader" or "Direct EPUB Download"
  requiredOffers?: number; // default 1 or 2
}

export const CpaLockerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUnlocked,
  bookId,
  bookTitle,
  targetActionName = 'Full Digital Access',
  requiredOffers = 2,
}) => {
  const [offers, setOffers] = useState<CpaOffer[]>([]);
  const [userIp, setUserIp] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeOfferId, setActiveOfferId] = useState<number | string | null>(null);
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);
  const [checkStatusType, setCheckStatusType] = useState<'idle' | 'checking' | 'error' | 'success'>('idle');
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [isUnlockedSuccess, setIsUnlockedSuccess] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load live offers whenever locker opens
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    // Check if already unlocked in localStorage
    if (LockerService.isUnlocked(bookId)) {
      onUnlocked();
      return;
    }

    setLoading(true);
    setCheckStatusMessage(null);
    setCheckStatusType('idle');
    setActiveOfferId(null);
    setIsUnlockedSuccess(false);

    LockerService.fetchOffers()
      .then((res) => {
        setOffers(res.offers);
        setUserIp(res.userIp);
      })
      .catch((err) => {
        console.error('[CPA Locker] Offers error:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, bookId, onUnlocked]);

  // Handle clicking an offer
  const handleOfferClick = (offer: CpaOffer) => {
    setActiveOfferId(offer.id);
    setCheckStatusType('checking');
    setCheckStatusMessage('Activity opened in a new tab. Complete the instructions, then check your status below.');

    // Open offer link in a new tab
    window.open(offer.link, '_blank', 'noopener,noreferrer');

    // Start background polling every 5 seconds
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      await verifyCompletion(false);
    }, 5000);
  };

  // Strictly verify completion against /api/check (no bypass, no fake timers)
  const verifyCompletion = async (isManualClick = false) => {
    if (isManualClick) {
      setCheckStatusType('checking');
      setCheckStatusMessage('Contacting CPA verification gateway...');
    }

    const res = await LockerService.checkCompletion(userIp);

    if (res.completed && res.count >= requiredOffers) {
      // Completed successfully!
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setCompletedCount(res.count);
      setIsUnlockedSuccess(true);
      setCheckStatusType('success');
      setCheckStatusMessage('🎉 Verification confirmed by network! Digital copy unlocked.');

      // Save 10-hour access in localStorage
      LockerService.setUnlocked(bookId);

      setTimeout(() => {
        onUnlocked();
      }, 1400);
    } else if (res.completed && res.count < requiredOffers) {
      // 1 offer done, but requires 2
      setCompletedCount(res.count);
      setCheckStatusType('error');
      setCheckStatusMessage(`Great! Offer 1 confirmed (${res.count}/${requiredOffers}). Please complete the second offer to unlock full access!`);
    } else {
      // Incomplete
      if (isManualClick) {
        setCheckStatusType('error');
        setCheckStatusMessage('❌ Not completed yet! Please finish the required activity in your opened tab before checking again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(17, 17, 17, 0.85)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          background: 'var(--paper, #fbfaf8)',
          border: '3px solid var(--ink, #111111)',
          boxShadow: 'var(--hard-xl, 8px 8px 0 #111111)',
          padding: '24px 22px',
          position: 'relative',
          boxSizing: 'border-box',
          animation: 'pop-in 0.2s ease-out',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="dialog-close"
          style={{ position: 'absolute', top: '14px', right: '14px' }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-display, monospace)',
              fontSize: '10.5px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              background: 'var(--accent, #ff3b1f)',
              color: '#ffffff',
              padding: '3px 8px',
              border: '1.5px solid var(--ink, #111)',
            }}
          >
            🔒 Protected Digital Archive
          </span>
          <span style={{ fontSize: '11px', color: 'var(--ink-soft, #555)', fontWeight: 600 }}>
            No credit card or account needed
          </span>
        </div>

        {/* Modal Title */}
        <h2
          style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: '22px',
            lineHeight: 1.2,
            margin: '0 0 6px',
            color: 'var(--ink, #111)',
            letterSpacing: '-0.02em',
          }}
        >
          Unlock {targetActionName}
        </h2>

        {bookTitle && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--ink-soft, #444)',
              margin: '0 0 14px',
              fontWeight: 600,
            }}
          >
            Volume: <span style={{ color: 'var(--ink, #111)', fontStyle: 'italic' }}>"{bookTitle}"</span>
          </p>
        )}

        {/* Step Progress Tracker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '2px solid var(--ink, #111)',
            padding: '10px 14px',
            marginBottom: '16px',
            boxShadow: 'var(--hard, 3px 3px 0 #111)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: isUnlockedSuccess ? '#00994d' : 'var(--accent, #ff3b1f)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 800,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {isUnlockedSuccess ? '✓' : '1'}
            </span>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink, #111)' }}>
                {isUnlockedSuccess
                  ? 'Access Verified'
                  : requiredOffers === 1
                  ? 'Complete 1 Quick Activity'
                  : `Complete ${requiredOffers} Activities (${completedCount}/${requiredOffers})`}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink-soft, #666)' }}>
                {isUnlockedSuccess
                  ? '10-hour full reading access active'
                  : 'Fast completion from our open digital sponsors'}
              </div>
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-display, monospace)',
              fontWeight: 800,
              fontSize: '11.5px',
              color: isUnlockedSuccess ? '#00994d' : 'var(--accent, #ff3b1f)',
              padding: '2px 8px',
              background: 'var(--paper, #f4f2ec)',
              border: '1px solid var(--ink, #111)',
            }}
          >
            {isUnlockedSuccess ? 'UNLOCKED' : 'LOCKED'}
          </div>
        </div>

        {/* Offer Cards Area */}
        {loading ? (
          <div style={{ padding: '30px 0', textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--ink, #111)',
                borderTopColor: 'var(--accent, #ff3b1f)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-soft, #555)', margin: 0 }}>
              Loading instant verification offers...
            </p>
          </div>
        ) : offers.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {offers.map((offer, index) => {
              const isSelected = activeOfferId === offer.id;
              return (
                <div
                  key={offer.id}
                  style={{
                    background: '#ffffff',
                    border: '2px solid var(--ink, #111)',
                    boxShadow: isSelected ? '4px 4px 0 var(--accent, #ff3b1f)' : '3px 3px 0 var(--ink, #111)',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Icon */}
                  {offer.image ? (
                    <img
                      src={offer.image}
                      alt=""
                      style={{
                        width: '44px',
                        height: '44px',
                        objectFit: 'cover',
                        border: '1.5px solid var(--ink, #111)',
                        flexShrink: 0,
                        background: '#eee',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        border: '1.5px solid var(--ink, #111)',
                        background: 'var(--paper-deep, #e6e3da)',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                      }}
                    >
                      ⚡
                    </div>
                  )}

                  {/* Text details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: 'var(--ink, #111)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {offer.name}
                      </span>
                      {offer.badge && (
                        <span
                          style={{
                            fontSize: '9.5px',
                            fontWeight: 800,
                            padding: '1px 5px',
                            background: index === 0 ? '#ffeedd' : '#e6f4ea',
                            color: index === 0 ? 'var(--accent, #ff3b1f)' : '#00994d',
                            border: '1px solid var(--ink, #111)',
                            flexShrink: 0,
                          }}
                        >
                          {offer.badge}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--ink-soft, #666)',
                        margin: 0,
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {offer.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => handleOfferClick(offer)}
                    className="btn btn--sm"
                    style={{
                      background: isSelected ? 'var(--accent, #ff3b1f)' : 'var(--paper, #f4f2ec)',
                      color: isSelected ? '#ffffff' : 'var(--ink, #111)',
                      borderColor: 'var(--ink, #111)',
                      flexShrink: 0,
                      fontSize: '12px',
                      padding: '8px 12px',
                      fontWeight: 700,
                    }}
                  >
                    {isSelected ? 'In Progress ⏳' : 'Start →'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              padding: '18px',
              background: 'var(--paper-deep, #e6e3da)',
              border: '2px solid var(--ink, #111)',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>
              Checking active verification channels for your region...
            </p>
          </div>
        )}

        {/* Status Notification Message */}
        {checkStatusMessage && (
          <div
            style={{
              padding: '10px 14px',
              marginBottom: '14px',
              fontSize: '12px',
              lineHeight: 1.45,
              fontWeight: 600,
              border: '2px solid var(--ink, #111)',
              background:
                checkStatusType === 'success'
                  ? '#e6f4ea'
                  : checkStatusType === 'error'
                  ? '#fce8e6'
                  : '#e8f0fe',
              color:
                checkStatusType === 'success'
                  ? '#137333'
                  : checkStatusType === 'error'
                  ? '#c5221f'
                  : '#1a73e8',
            }}
          >
            {checkStatusMessage}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '11px', color: 'var(--ink-soft, #777)', fontWeight: 500 }}>
            🔒 Anti-bypass: Instant unlock triggered via verified CPA postback.
          </div>

          <button
            type="button"
            onClick={() => verifyCompletion(true)}
            disabled={checkStatusType === 'checking' && loading}
            className="btn btn--primary btn--sm"
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Check Status Now ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
