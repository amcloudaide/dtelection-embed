=== dtElection Poll Embed ===
Contributors: dtelection
Tags: poll, voting, survey, scheduling, embed
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.1.0
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
