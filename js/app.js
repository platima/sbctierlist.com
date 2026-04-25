const Modal = ({ isOpen, titleId, onClose, initialFocusRef, children }) => {
  const dialogRef = React.useRef(null);

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const focusTarget = initialFocusRef && initialFocusRef.current
      ? initialFocusRef.current
      : dialogRef.current;

    if (focusTarget) {
      window.requestAnimationFrame(() => {
        focusTarget.focus();
      });
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [initialFocusRef, isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={dialogRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <button
            type="button"
            onClick={onClose}
            className="modal-close"
            aria-label="Close board details"
            ref={initialFocusRef}
          >
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

const TierList = () => {
  const TIERS = ['S', 'A', 'B', 'C', 'D', 'F'];

  // Score ranges that define each tier
  const TIER_SCORES = {
    S: '25+',
    A: '20-24',
    B: '15-19',
    C: '10-14',
    D: '5-9',
    F: '0-4',
  };
  
  // Map display names to actual filter values
  const FILTER_MAPPING = {
    'All': 'all',
    'SBCs': 'sbc',
    'eSBCs': 'esbc',
    'ESBs': 'esb',
    'DevBoards': 'devboard'
  };
  
  const FILTERS = Object.keys(FILTER_MAPPING); // Use display names for UI

  const [items, setItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const [selectedItem, setSelectedItem] = React.useState(null);
  const closeButtonRef = React.useRef(null);
  const lastTriggerRef = React.useRef(null);
  const modalTitleId = 'selected-item-title';

  React.useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setLoadError('');

    fetch('data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format');
        }

        if (isMounted) {
          setItems(data);
        }
      })
      .catch(error => {
        console.error('Error loading data:', error);

        if (isMounted) {
          setItems([]);
          setLoadError('Unable to load the board list right now. Please refresh and try again.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'All') return true;
    
    // Case insensitive comparison with the mapped filter value
    const itemType = (item.type || '').toLowerCase();
    const filterValue = FILTER_MAPPING[filter].toLowerCase();
    return itemType === filterValue;
  });

  const formatDate = (dateString) => {
    const reviewDate = new Date(dateString);

    if (Number.isNaN(reviewDate.getTime())) {
      return dateString;
    }

    return reviewDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openItemDetails = (item, event) => {
    lastTriggerRef.current = event.currentTarget;
    setSelectedItem(item);
  };

  const closeModal = () => {
    const trigger = lastTriggerRef.current;

    setSelectedItem(null);

    if (trigger && typeof trigger.focus === 'function') {
      window.requestAnimationFrame(() => {
        if (document.contains(trigger)) {
          trigger.focus();
        }
      });
    }
  };

  const showEmptyFilterState = !isLoading && !loadError && filteredItems.length === 0;

  return (
    <div className="container">
      <h1>SBC Tier List</h1>
      
      {/* Filter Buttons */}
      <div className="filter-buttons" role="group" aria-label="Board type filters">
        {FILTERS.map(filterOption => (
          <button
            type="button"
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            aria-pressed={filter === filterOption}
            className={filter === filterOption ? 'active' : ''}
          >
            {filterOption}
          </button>
        ))}
      </div>
      <div className="filter-info">
        Filter definitions available at <a href="https://github.com/platima/board-taxomomies" target="_blank" rel="noopener noreferrer">github.com/platima/board-taxomomies</a>
      </div>

      {isLoading && (
        <div className="status-panel" role="status" aria-live="polite">
          Loading boards...
        </div>
      )}

      {loadError && (
        <div className="status-panel status-error" role="alert">
          {loadError}
        </div>
      )}

      {showEmptyFilterState && (
        <div className="status-panel" role="status" aria-live="polite">
          No boards match the current filter.
        </div>
      )}

      {/* Tier List */}
      {!isLoading && !loadError && (
        <div className="tier-list">
          {TIERS.map(tier => (
            <div key={tier} className="tier-row">
              <div className={`tier-label ${tier}`}>
                <span className="tier-letter">{tier}</span>
                <span className="tier-score">{TIER_SCORES[tier]}</span>
              </div>
              
              <div className="tier-content">
                {filteredItems
                  .filter(item => item.tier === tier)
                  .sort((a, b) => a.tierPosition - b.tierPosition)
                  .map(item => (
                    <button
                      type="button"
                      key={`${item.name}-${item.tier}-${item.tierPosition}`}
                      onClick={(event) => openItemDetails(item, event)}
                      className="item-card"
                      aria-haspopup="dialog"
                      aria-label={`Open details for ${item.name}`}
                    >
                      <img
                        src={item.imagePath}
                        alt={`${item.name} board`}
                        title={item.name}
                        loading="lazy"
                      />
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={!!selectedItem} 
        titleId={modalTitleId}
        onClose={closeModal}
        initialFocusRef={closeButtonRef}
      >
        {selectedItem && (
          <>
            <h2 id={modalTitleId} className="modal-title">{selectedItem.name}</h2>
            <div className="modal-image-frame">
              <img
                src={selectedItem.imagePath}
                alt={`${selectedItem.name} board`}
                className="modal-image"
              />
            </div>
            <div className="modal-details">
              <p>
                <strong>Type:</strong> <a href="https://github.com/platima/board-taxomomies" target="_blank" rel="noopener noreferrer">{selectedItem.type}</a>
              </p>
              <p>
                <strong>Review Date:</strong> {formatDate(selectedItem.reviewDate)}
              </p>
              <p>
                <strong>Video Review:</strong>{' '}
                <a
                  href={selectedItem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Watch on YouTube
                </a>
              </p>
              <p>
                <strong>Purchase:</strong>{' '}
                <a
                  href={selectedItem.purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy Now
                </a>
              </p>
            </div>
          </>
        )}
      </Modal>
      {/* Footer */}
      <footer className="footer">
        <a href="https://shop.plati.ma" target="_blank" rel="noopener noreferrer">SBC Shop</a> 
        <a href="https://youtube.com/@PlatimaTinkers" target="_blank" rel="noopener noreferrer">YouTube Channel</a><br/>
        <img align="center" src="https://visitor-badge.laobi.icu/badge?page_id=platima.sbctierlist.com" alt="Visitor counter" height="20" /> 
      </footer>
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TierList />);
