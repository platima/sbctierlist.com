<img align="right" src="https://visitor-badge.laobi.icu/badge?page_id=platima.sbctierlist" height="20" />

# SBC Tier List

A dynamic, responsive tier list website for Single Board Computers (SBCs), embedded SBCs, Embedded System Boards, and Development Boards. The site provides a visual ranking system with S through D tiers, allowing users to quickly assess and compare different boards.

**<p align="center">You can find the live website at [sbctierlist.com](https://sbctierlist.com)</p>**

## Features

- 📊 Interactive tier list display (S through D rankings)
- 🔍 Filtering system for different board types:
  - Single Board Computers (SBCs)
  - Embedded Single Board Computers (eSBCs)
  - Embedded System Boards (ESBs)
  - DevBoards / EvalBoards
- 📱 Fully responsive design that works on mobile and desktop
- 🖼️ Modal view for detailed board information
- 🔗 Links to video reviews and purchase options
- 🌙 Dark mode interface
- 🏷️ Standardised board type definitions following [platima/board-taxonomies](https://github.com/platima/board-taxomomies)

## Data Structure

The site loads board data from a `data.json` file with the following structure:

```json
[
  {
    "name": "Waveshare RP2350-Plus 4MB",
    "videoUrl": "https://youtu.be/example",
    "imagePath": "img/waveshare-rp2350-plus.png",
    "tier": "S",
    "tierPosition": 0,
    "reviewDate": "2025-01-10",
    "purchaseLink": "https://example.com/product",
    "type": "sbc"
  }
]
```

### Data Fields

- `name`: Board name
- `videoUrl`: YouTube review link
- `imagePath`: Path to board image
- `tier`: Ranking (S/A/B/C/D)
- `tierPosition`: Position within tier (0 based)
- `reviewDate`: Date of review
- `purchaseLink`: Where to purchase
- `type`: Board category (sbc/esbc/esb/devboard)

## Development

This is a static site using vanilla JavaScript with React loaded via CDN. No build process is required.

### Local Development

1. Clone the repository
2. Set up a local web server (e.g., using Python):
   ```bash
   python -m http.server 8000
   ```
3. Visit `http://localhost:8000`

### Adding New Boards

1. Add the board image to the `img/` directory
2. Update `data.json` with the board information
3. Commit and push changes

## Deployment

The site is hosted on GitHub Pages with a custom domain. To deploy updates:

1. Push changes to the main branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. The site will be available at the configured domain

## License

[Apache 2.0 License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
