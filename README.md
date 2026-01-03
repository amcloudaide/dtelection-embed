# dtElection Poll Embed

A WordPress plugin to embed [dtElection](https://dtelection.com) polls in your WordPress site.

## Features

- **Easy embedding** - Just paste your poll URL or token
- **Inline voting** - Visitors vote without leaving your site
- **Gutenberg block** - Modern block editor support
- **Shortcode support** - Works with classic editor too
- **Responsive design** - Looks great on all devices

## Installation

1. Download or clone this repository
2. Upload the `dtelection-embed` folder to `/wp-content/plugins/`
3. Activate the plugin through the 'Plugins' menu in WordPress

## Usage

### Gutenberg Block

1. In the block editor, click "+" to add a block
2. Search for "dtElection Poll"
3. Paste your poll URL or token

### Shortcode

```
[dtelection poll="abc123"]
```

Or with a full URL:

```
[dtelection poll="https://dtelection.com/poll/abc123"]
```

## Requirements

- WordPress 5.0+
- PHP 7.4+

## License

GPL v2 or later
