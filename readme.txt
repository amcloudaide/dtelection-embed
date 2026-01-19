=== dtElection Poll Embed ===
Contributors: dtelection
Tags: poll, voting, survey, scheduling, embed
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.6.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed dtElection polls in your WordPress site. Let visitors vote on polls directly without leaving your site.

== Description ==

**dtElection Poll Embed** lets you embed polls from [dtElection](https://dtelection.com) directly into your WordPress posts and pages.

= Features =

* **Easy embedding** - Just paste your poll URL or token
* **Inline voting** - Visitors vote without leaving your site
* **Gutenberg block** - Modern block editor support
* **Shortcode support** - Works with classic editor too
* **Responsive design** - Looks great on all devices
* **Real-time results** - Poll updates after voting
* **Yes/Maybe/No voting** - Full support for 3-option voting
* **Email collection** - Optional email requirement for voters
* **Location display** - Show poll location with Google Maps link
* **Hero images** - Display poll hero images (Pro+ feature)
* **External links** - Show attached links (Enterprise feature)
* **White-label option** - Remove branding for Pro+ tiers

= How to Use =

1. Create a poll at [dtelection.com](https://dtelection.com)
2. Copy the poll URL or token
3. Add to your WordPress content:
   * **Gutenberg**: Insert "dtElection Poll" block, paste URL/token
   * **Shortcode**: `[dtelection poll="YOUR_TOKEN"]`

= Examples =

Using the shortcode with a token:
`[dtelection poll="abc123"]`

Using the shortcode with a full URL:
`[dtelection poll="https://dtelection.com/poll/abc123"]`

== Installation ==

1. Upload the `dtelection-embed` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Start embedding polls using the shortcode or Gutenberg block

== Frequently Asked Questions ==

= Do I need a dtElection account? =

You need to create polls at dtelection.com first. Creating polls is free.

= Can visitors vote without an account? =

Yes! Visitors can vote on embedded polls without creating any account.

= Does this work with the block editor? =

Yes! There's a dedicated "dtElection Poll" block for the Gutenberg editor.

= Can I style the poll to match my theme? =

The current version uses dtElection branding. Custom styling options are planned for a future release.

== Screenshots ==

1. Embedded poll in a WordPress post
2. Gutenberg block in the editor
3. Mobile responsive view

== Changelog ==

= 1.6.0 =
* Added Yes/Maybe/No voting buttons for polls with "allow maybe" enabled
* Added email input field when poll requires email
* Added location display with clickable Google Maps link
* Added hero image support (displayed at top of poll)
* Added external link display (Enterprise feature)
* Added conditional branding - Pro/Enterprise tiers can hide dtElection branding
* Improved results display showing separate yes/maybe counts
* Updated responsive styles for mobile devices

= 1.5.0 =
* Added single selection mode (radio buttons vs checkboxes)
* Improved error handling with specific error messages
* Better domain whitelist validation

= 1.4.0 =
* Added support for closed poll detection
* Improved vote submission error handling

= 1.3.0 =
* Added dtElection favicon to brand link
* Brand link now opens the actual poll on dtElection
* Result bars now use dtElection colors (teal/orange)
* Leading vote highlighted in orange
* Improved visual design

= 1.1.0 =
* Added duplicate vote prevention (remembers if user voted via localStorage)
* Added "How to Use" documentation page in WordPress admin
* Added dtElection menu item with full usage guide
* Shows "already voted" message with voter name
* Improved user experience for returning visitors

= 1.0.0 =
* Initial release
* Shortcode support
* Gutenberg block support
* Inline voting

== Upgrade Notice ==

= 1.1.0 =
Duplicate vote prevention and in-admin documentation page.

= 1.0.0 =
Initial release of dtElection Poll Embed.
