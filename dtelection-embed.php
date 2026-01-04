<?php
/**
 * Plugin Name: dtElection Poll Embed
 * Plugin URI: https://dtelection.com
 * Description: Embed dtElection polls in your WordPress site with a simple shortcode or Gutenberg block.
 * Version: 1.3.0
 * Author: dtElection
 * Author URI: https://dtelection.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: dtelection-embed
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('DTELECTION_VERSION', '1.3.0');
define('DTELECTION_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DTELECTION_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DTELECTION_API_URL', 'https://dtelection.com/api/v1/embed');

/**
 * Initialize the plugin
 */
function dtelection_init() {
    // Register shortcode
    add_shortcode('dtelection', 'dtelection_render_shortcode');

    // Register scripts and styles
    add_action('wp_enqueue_scripts', 'dtelection_register_assets');

    // Register Gutenberg block
    add_action('init', 'dtelection_register_block');
}
add_action('plugins_loaded', 'dtelection_init');

/**
 * Register plugin assets
 */
function dtelection_register_assets() {
    wp_register_style(
        'dtelection-embed',
        DTELECTION_PLUGIN_URL . 'assets/css/embed.css',
        array(),
        DTELECTION_VERSION
    );

    wp_register_script(
        'dtelection-embed',
        DTELECTION_PLUGIN_URL . 'assets/js/embed.js',
        array(),
        DTELECTION_VERSION,
        true
    );

    // Pass API URL to JavaScript
    wp_localize_script('dtelection-embed', 'dtelectionConfig', array(
        'apiUrl' => DTELECTION_API_URL
    ));
}

/**
 * Register Gutenberg block
 */
function dtelection_register_block() {
    // Check if Gutenberg is available
    if (!function_exists('register_block_type')) {
        return;
    }

    // Register block editor assets
    wp_register_script(
        'dtelection-block-editor',
        DTELECTION_PLUGIN_URL . 'blocks/poll/index.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'),
        DTELECTION_VERSION
    );

    // Register the block
    register_block_type('dtelection/poll', array(
        'editor_script' => 'dtelection-block-editor',
        'render_callback' => 'dtelection_render_block',
        'attributes' => array(
            'token' => array(
                'type' => 'string',
                'default' => ''
            )
        )
    ));
}

/**
 * Extract token from URL or return as-is
 */
function dtelection_extract_token($input) {
    $input = trim($input);

    // Check if it's a full URL
    if (preg_match('/poll\/([a-zA-Z0-9]+)/', $input, $matches)) {
        return $matches[1];
    }

    // Return as-is (assume it's already a token)
    return sanitize_text_field($input);
}

/**
 * Render shortcode
 */
function dtelection_render_shortcode($atts) {
    $atts = shortcode_atts(array(
        'poll' => '',
        'token' => '' // Alternative attribute name
    ), $atts, 'dtelection');

    // Support both 'poll' and 'token' attributes
    $token_input = !empty($atts['poll']) ? $atts['poll'] : $atts['token'];

    if (empty($token_input)) {
        return '<!-- dtElection: No poll token provided -->';
    }

    $token = dtelection_extract_token($token_input);

    if (empty($token)) {
        return '<!-- dtElection: Invalid poll token -->';
    }

    // Enqueue assets
    wp_enqueue_style('dtelection-embed');
    wp_enqueue_script('dtelection-embed');

    // Return container for JavaScript to populate
    return sprintf(
        '<div class="dtelection-poll" data-token="%s"><div class="dte-loading">Loading poll...</div></div>',
        esc_attr($token)
    );
}

/**
 * Render Gutenberg block
 */
function dtelection_render_block($attributes) {
    if (empty($attributes['token'])) {
        return '';
    }

    // Use the shortcode renderer
    return dtelection_render_shortcode(array('token' => $attributes['token']));
}

/**
 * Add settings link to plugins page
 */
function dtelection_plugin_action_links($links) {
    $docs_link = '<a href="' . admin_url('admin.php?page=dtelection-docs') . '">' . __('How to Use', 'dtelection-embed') . '</a>';
    $get_polls_link = '<a href="https://dtelection.com" target="_blank">' . __('Get Polls', 'dtelection-embed') . '</a>';
    array_unshift($links, $get_polls_link);
    array_unshift($links, $docs_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'dtelection_plugin_action_links');

/**
 * Add admin menu page
 */
function dtelection_admin_menu() {
    add_menu_page(
        __('dtElection', 'dtelection-embed'),
        __('dtElection', 'dtelection-embed'),
        'manage_options',
        'dtelection-docs',
        'dtelection_render_docs_page',
        'dashicons-chart-bar',
        100
    );
}
add_action('admin_menu', 'dtelection_admin_menu');

/**
 * Render documentation page
 */
function dtelection_render_docs_page() {
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?> Poll Embed</h1>

        <div style="max-width: 800px; margin-top: 20px;">

            <!-- Overview -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Overview</h2>
                <p>
                    Embed <a href="https://dtelection.com" target="_blank">dtElection</a> polls directly in your WordPress posts and pages.
                    Visitors can vote without leaving your site!
                </p>
            </div>

            <!-- Getting a Poll Token -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Step 1: Get Your Poll Token</h2>
                <ol>
                    <li>Go to <a href="https://dtelection.com" target="_blank">dtelection.com</a> and create an account</li>
                    <li>Create a new poll (click "+ New Poll")</li>
                    <li>After creating, copy the share link or token from the poll page</li>
                </ol>
                <p><strong>Example share link:</strong> <code>https://dtelection.com/poll/abc123xyz</code></p>
                <p><strong>The token is:</strong> <code>abc123xyz</code></p>
            </div>

            <!-- Using Shortcode -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Step 2a: Embed with Shortcode</h2>
                <p>Use the shortcode in the Classic Editor or any shortcode-enabled area:</p>

                <h4>Using the token:</h4>
                <pre style="background: #f1f1f1; padding: 15px; border-radius: 4px; overflow-x: auto;">[dtelection poll="abc123xyz"]</pre>

                <h4>Using the full URL:</h4>
                <pre style="background: #f1f1f1; padding: 15px; border-radius: 4px; overflow-x: auto;">[dtelection poll="https://dtelection.com/poll/abc123xyz"]</pre>

                <p><em>Both formats work - the plugin automatically extracts the token from URLs.</em></p>
            </div>

            <!-- Using Gutenberg -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Step 2b: Embed with Gutenberg Block</h2>
                <ol>
                    <li>In the Block Editor, click the <strong>+</strong> button to add a block</li>
                    <li>Search for <strong>"dtElection Poll"</strong></li>
                    <li>Add the block and paste your poll URL or token</li>
                    <li>The poll preview will appear in the editor</li>
                </ol>
            </div>

            <!-- Features -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Features</h2>
                <ul>
                    <li><strong>Inline Voting</strong> - Visitors vote directly on your site</li>
                    <li><strong>Duplicate Prevention</strong> - Remembers if a user has already voted</li>
                    <li><strong>Responsive Design</strong> - Looks great on all devices</li>
                    <li><strong>Real-time Sync</strong> - Votes are synced to dtElection instantly</li>
                    <li><strong>Closed Poll Support</strong> - Shows "closed" message for expired polls</li>
                </ul>
            </div>

            <!-- Poll Types -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Supported Poll Types</h2>
                <table class="widefat" style="margin-top: 10px;">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>When Poll</strong></td>
                            <td>Schedule meetings by letting participants vote on available time slots</td>
                        </tr>
                        <tr>
                            <td><strong>What Poll</strong></td>
                            <td>General polls with custom options (e.g., "Where should we eat?")</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Troubleshooting -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Troubleshooting</h2>
                <table class="widefat" style="margin-top: 10px;">
                    <thead>
                        <tr>
                            <th>Issue</th>
                            <th>Solution</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>"Poll not found"</td>
                            <td>Check that the token/URL is correct and the poll is public</td>
                        </tr>
                        <tr>
                            <td>Poll not loading</td>
                            <td>Ensure your site can reach dtelection.com (no firewall blocking)</td>
                        </tr>
                        <tr>
                            <td>"Already voted" showing</td>
                            <td>Clear browser localStorage to vote again (for testing)</td>
                        </tr>
                        <tr>
                            <td>Styling issues</td>
                            <td>Check for CSS conflicts with your theme</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Links -->
            <div class="card" style="max-width: 100%; padding: 20px; margin-bottom: 20px;">
                <h2 style="margin-top: 0;">Useful Links</h2>
                <ul>
                    <li><a href="https://dtelection.com" target="_blank">dtElection Website</a></li>
                    <li><a href="https://dtelection.com/poll/new" target="_blank">Create a New Poll</a></li>
                    <li><a href="https://dtelection.com/dashboard" target="_blank">Your Polls Dashboard</a></li>
                    <li><a href="https://github.com/amcloudaide/dtelection-embed" target="_blank">Plugin on GitHub</a></li>
                </ul>
            </div>

            <!-- Version Info -->
            <p style="color: #666; font-size: 12px;">
                Plugin Version: <?php echo DTELECTION_VERSION; ?> |
                <a href="https://github.com/amcloudaide/dtelection-embed" target="_blank">View on GitHub</a>
            </p>

        </div>
    </div>
    <?php
}
