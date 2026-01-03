<?php
/**
 * Plugin Name: dtElection Poll Embed
 * Plugin URI: https://dtelection.com
 * Description: Embed dtElection polls in your WordPress site with a simple shortcode or Gutenberg block.
 * Version: 1.0.0
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
define('DTELECTION_VERSION', '1.0.0');
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
    $settings_link = '<a href="https://dtelection.com" target="_blank">' . __('Get Polls', 'dtelection-embed') . '</a>';
    array_unshift($links, $settings_link);
    return $links;
}
add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'dtelection_plugin_action_links');
