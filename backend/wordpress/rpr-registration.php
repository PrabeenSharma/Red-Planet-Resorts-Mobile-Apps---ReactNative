<?php
/**
 * Plugin Name: Red Planet Resorts – App Registration
 * Description: REST endpoint used by the Red Planet Resorts mobile app to store user registrations.
 * Version:     1.0.0
 *
 * Endpoint: POST /wp-json/custom/v1/register-user
 * Body (JSON): { full_name, email, address, nasa_id?, platform? }
 *
 * Install: copy this file to wp-content/plugins/rpr-registration/rpr-registration.php
 * and activate it (or paste the contents into the theme's functions.php).
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', function () {
    register_post_type('rpr_registration', [
        'label'           => 'App Registrations',
        'public'          => false,
        'show_ui'         => true,
        'show_in_menu'    => true,
        'menu_icon'       => 'dashicons-id',
        'supports'        => ['title', 'custom-fields'],
        'capability_type' => 'post',
        'capabilities'    => ['create_posts' => 'do_not_allow'],
        'map_meta_cap'    => true,
    ]);
});

add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/register-user', [
        'methods'             => WP_REST_Server::CREATABLE,
        'permission_callback' => '__return_true',
        'callback'            => 'rpr_register_user',
        'args'                => [
            'full_name' => ['required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'email'     => ['required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_email'],
            'address'   => ['required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_textarea_field'],
            'nasa_id'   => ['required' => false, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field'],
            'platform'  => ['required' => false, 'type' => 'string', 'sanitize_callback' => 'sanitize_key'],
        ],
    ]);
});

function rpr_register_user(WP_REST_Request $request)
{
    $full_name = trim($request->get_param('full_name'));
    $email     = strtolower(trim($request->get_param('email')));
    $address   = trim($request->get_param('address'));
    $nasa_id   = strtoupper(trim((string) $request->get_param('nasa_id')));
    $platform  = (string) $request->get_param('platform');

    if (strlen($full_name) < 2 || strlen($address) < 5) {
        return new WP_REST_Response(['success' => false, 'message' => 'Please fill in all required fields.'], 400);
    }

    if (!is_email($email)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Please enter a valid email address.'], 400);
    }

    // Basic abuse protection: max 10 requests per IP per 10 minutes.
    $ip_key = 'rpr_reg_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    $hits   = (int) get_transient($ip_key);
    if ($hits >= 10) {
        return new WP_REST_Response(['success' => false, 'message' => 'Too many attempts. Please try again later.'], 429);
    }
    set_transient($ip_key, $hits + 1, 10 * MINUTE_IN_SECONDS);

    // Same email registers again → update the existing record instead of duplicating it.
    $existing = get_posts([
        'post_type'      => 'rpr_registration',
        'post_status'    => 'any',
        'meta_key'       => 'email',
        'meta_value'     => $email,
        'fields'         => 'ids',
        'posts_per_page' => 1,
    ]);

    $post_data = [
        'post_type'   => 'rpr_registration',
        'post_status' => 'publish',
        'post_title'  => sprintf('%s <%s>', $full_name, $email),
    ];

    if ($existing) {
        $post_data['ID'] = $existing[0];
        $post_id = wp_update_post($post_data, true);
    } else {
        $post_id = wp_insert_post($post_data, true);
    }

    if (is_wp_error($post_id)) {
        return new WP_REST_Response(['success' => false, 'message' => 'Could not save registration.'], 500);
    }

    update_post_meta($post_id, 'full_name', $full_name);
    update_post_meta($post_id, 'email', $email);
    update_post_meta($post_id, 'address', $address);
    update_post_meta($post_id, 'nasa_id', $nasa_id);
    update_post_meta($post_id, 'platform', $platform);
    update_post_meta($post_id, 'registered_at', current_time('mysql'));

    return new WP_REST_Response([
        'success' => true,
        'message' => $existing ? 'Registration updated.' : 'Registration saved.',
        'id'      => $post_id,
    ], 200);
}
