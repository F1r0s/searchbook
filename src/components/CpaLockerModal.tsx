import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  targetActionName = 'Digital Access',
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

  // Prevent background scroll while locker is active
  useEffect(() => {
    if (!isOpen) return;
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen]);

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
    setCheckStatusMessage('Activity opened in a new tab. Finish the requirements, then click "Check Status Now" below.');

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
      setCheckStatusMessage('🎉 Verification confirmed by network! Full digital access unlocked.');

      // Save 10-hour access in localStorage
      LockerService.setUnlocked(bookId);

      setTimeout(() => {
        onUnlocked();
      }, 1400);
    } else if (res.completed && res.count < requiredOffers) {
      // 1 offer done, but requires 2
      setCompletedCount(res.count);
      setCheckStatusType('error');
      setCheckStatusMessage(`Great! Offer 1 confirmed (${res.count}/${requiredOffers}). Please complete the 2nd offer to unlock full access!`);
    } else {
      // Incomplete
      if (isManualClick) {
        setCheckStatusType('error');
        setCheckStatusMessage('❌ Not completed yet! Please finish the required activity in your opened tab before checking again.');
      }
    }
  };

  if (!isOpen) return null;

  const modalJsx = (
    <div
      className="cpa-locker-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(17, 17, 17, 0.88)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <div
        className="cpa-locker-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: 'min(92dvh, 720px)',
          background: 'var(--paper, #fbfaf8)',
          border: '3px solid var(--ink, #111111)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), var(--hard-xl, 8px 8px 0 #111111)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden',
          animation: 'pop-in 0.2s ease-out',
        }}
      >
        {/* Sticky Modal Header */}
        <div
          style={{
            padding: '16px 18px 12px',
            borderBottom: '2.5px solid var(--ink, #111111)',
            background: 'var(--paper, #fbfaf8)',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--ink, #111)',
              background: '#ffffff',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '2px 2px 0 var(--ink, #111)',
            }}
          >
            ✕
          </button>

          {/* Header Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-display, monospace)',
                fontSize: '10px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'var(--accent, #ff3b1f)',
                color: '#ffffff',
                padding: '2px 6px',
                border: '1.5px solid var(--ink, #111)',
              }}
            >
              🔒 Protected Digital Archive
            </span>
            <span style={{ fontSize: '10.5px', color: 'var(--ink-soft, #555)', fontWeight: 600 }}>
              No credit card needed
            </span>
          </div>

          {/* Modal Title */}
          <h2
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: 'clamp(18px, 4.5vw, 22px)',
              lineHeight: 1.15,
              margin: '0 0 4px',
              color: 'var(--ink, #111)',
              letterSpacing: '-0.02em',
              paddingRight: '36px',
            }}
          >
            Unlock {targetActionName}
          </h2>

          {bookTitle && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--ink-soft, #444)',
                margin: 0,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Volume: <span style={{ color: 'var(--ink, #111)', fontStyle: 'italic' }}>"{bookTitle}"</span>
            </p>
          )}
        </div>

        {/* Scrollable Modal Content (Touch-Optimized for all mobile screens) */}
        <div
          style={{
            padding: '14px 16px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Step Progress Tracker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
              border: '2px solid var(--ink, #111)',
              padding: '8px 12px',
              boxShadow: 'var(--hard, 2px 2px 0 #111)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: isUnlockedSuccess ? '#00994d' : 'var(--accent, #ff3b1f)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                {isUnlockedSuccess ? '✓' : '1'}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink, #111)' }}>
                  {isUnlockedSuccess
                    ? 'Access Verified'
                    : requiredOffers === 1
                    ? 'Complete 1 Quick Activity'
                    : `Complete ${requiredOffers} Activities (${completedCount}/${requiredOffers})`}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--ink-soft, #666)' }}>
                  {isUnlockedSuccess
                    ? '10-hour full reading access active'
                    : 'Choose either sponsor activity below'}
                </div>
              </div>
            </div>

            <div
              style={{
                fontFamily: 'var(--font-display, monospace)',
                fontWeight: 800,
                fontSize: '10.5px',
                color: isUnlockedSuccess ? '#00994d' : 'var(--accent, #ff3b1f)',
                padding: '2px 6px',
                background: 'var(--paper, #f4f2ec)',
                border: '1px solid var(--ink, #111)',
                flexShrink: 0,
              }}
            >
              {isUnlockedSuccess ? 'UNLOCKED' : 'LOCKED'}
            </div>
          </div>

          {/* Offer Cards Area */}
          {loading ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  border: '3px solid var(--ink, #111)',
                  borderTopColor: 'var(--accent, #ff3b1f)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 10px',
                }}
              />
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ink-soft, #555)', margin: 0 }}>
                Loading live verification activities...
              </p>
            </div>
          ) : offers.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {offers.map((offer, index) => {
                const isSelected = activeOfferId === offer.id;
                return (
                  <div
                    key={offer.id}
                    onClick={() => handleOfferClick(offer)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOfferClick(offer);
                      }
                    }}
                    style={{
                      background: isSelected ? '#fffdf7' : '#ffffff',
                      border: isSelected ? '2.5px solid var(--accent, #ff3b1f)' : '2px solid var(--ink, #111)',
                      boxShadow: isSelected ? '3px 3px 0 var(--accent, #ff3b1f)' : '2px 2px 0 var(--ink, #111)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {/* Icon */}
                    {offer.image ? (
                      <img
                        src={offer.image}
                        alt=""
                        style={{
                          width: '42px',
                          height: '42px',
                          objectFit: 'cover',
                          border: '1.5px solid var(--ink, #111)',
                          flexShrink: 0,
                          background: '#eee',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          border: '1.5px solid var(--ink, #111)',
                          background: 'var(--paper-deep, #e6e3da)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '18px',
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOfferClick(offer);
                      }}
                      className="btn btn--sm"
                      style={{
                        background: isSelected ? 'var(--accent, #ff3b1f)' : 'var(--ink, #111)',
                        color: '#ffffff',
                        borderColor: 'var(--ink, #111)',
                        flexShrink: 0,
                        fontSize: '12px',
                        padding: '8px 12px',
                        fontWeight: 800,
                        boxShadow: 'var(--hard, 2px 2px 0 var(--ink))',
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
                padding: '14px',
                background: 'var(--paper-deep, #e6e3da)',
                border: '2px solid var(--ink, #111)',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600 }}>
                Checking active verification channels for your device...
              </p>
            </div>
          )}

          {/* Status Notification Alert */}
          {checkStatusMessage && (
            <div
              style={{
                padding: '8px 12px',
                fontSize: '11.5px',
                lineHeight: 1.4,
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
        </div>

        {/* Sticky Modal Footer (Always visible & reachable on mobile) */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '2px solid var(--ink, #111)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--ink-soft, #666)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>🔒</span>
            <span>Instant unlock via verified CPA postback</span>
          </div>

          <button
            type="button"
            onClick={() => verifyCompletion(true)}
            disabled={checkStatusType === 'checking' && loading}
            className="btn btn--primary"
            style={{
              padding: '10px 18px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              marginLeft: 'auto',
              boxShadow: 'var(--hard, 2px 2px 0 var(--ink))',
            }}
          >
            Check Status Now ⚡
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJsx, document.body) : modalJsx;
};
