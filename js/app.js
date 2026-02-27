const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  return (
    <div className="modal-backdrop fixed inset-0 flex items-center justify-center p-4" onClick={handleBackdropClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <button onClick={onClose} className="modal-close">
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
  const TIERS = ['S', 'A', 'B', 'C', 'D'];
  
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
  const [filter, setFilter] = React.useState('All');
  const [selectedItem, setSelectedItem] = React.useState(null);

  React.useEffect(() => {
    fetch('data.json')
      .then(response => response.json())
      .then(data => setItems(data))
      .catch(error => console.error('Error loading data:', error));
  }, []);

  const filteredItems = items.filter(item => {
    if (filter === 'All') return true;
    
    // Case insensitive comparison with the mapped filter value
    const itemType = (item.type || '').toLowerCase();
    const filterValue = FILTER_MAPPING[filter].toLowerCase();
    return itemType === filterValue;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1>SBC Tier List</h1>
      
      {/* Filter Buttons */}
      <div className="filter-buttons">
        {FILTERS.map(filterOption => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={filter === filterOption ? 'active' : ''}
          >
            {filterOption}
          </button>
        ))}
      </div>
      <div className="filter-info">
        Filter definitions available at <a href="https://github.com/platima/board-taxomomies" target="_blank" rel="noopener noreferrer">github.com/platima/board-taxomomies</a>
      </div>

      {/* Tier List */}
      <div className="tier-list">
        {TIERS.map(tier => (
          <div key={tier} className="tier-row">
            <div className={`tier-label ${tier}`}>
              {tier}
            </div>
            
            <div className="tier-content">
              {filteredItems
                .filter(item => item.tier === tier)
                .sort((a, b) => a.tierPosition - b.tierPosition)
                .map(item => (
                  <div
                    key={item.name}
                    onClick={() => setSelectedItem(item)}
                    className="item-card"
                  >
                    <img
                      src={item.imagePath}
                      alt={item.name}
                      title={item.name}
                      loading="lazy"
                    />
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)}
      >
        {selectedItem && (
          <>
            <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
            <div className="aspect-video mb-4">
              <img
                src={selectedItem.imagePath}
                alt={selectedItem.name}
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="space-y-3">
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
        <img align="center" src="https://visitor-badge.laobi.icu/badge?page_id=platima.sbctierlist.com" height="20" /> 
      </footer>
    </div>
  );
};

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TierList />);
