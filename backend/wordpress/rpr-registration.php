<?php
/**
 * Plugin Name: Red Planet Resorts – App Registration
 * Description: Registration and account-update REST endpoints for the Red Planet Resorts app.
 * Version: 1.1.0
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
    ]);

    register_rest_route('custom/v1', '/account-update', [
        'methods'             => WP_REST_Server::CREATABLE,
        'permission_callback' => '__return_true',
        'callback'            => 'rpr_update_account',
    ]);
});

function rpr_get_registration_fields(WP_REST_Request $request) {
    return [
        'first_name'       => sanitize_text_field((string) $request->get_param('first_name')),
        'last_name'        => sanitize_text_field((string) $request->get_param('last_name')),
        'call_sign'        => sanitize_text_field((string) $request->get_param('call_sign')),
        'city'             => sanitize_text_field((string) $request->get_param('city')),
        'state'            => sanitize_text_field((string) $request->get_param('state')),
        'country'          => sanitize_text_field((string) $request->get_param('country')),
        'email'            => sanitize_email((string) $request->get_param('email')),
        'nasa_id'          => strtoupper(sanitize_text_field((string) $request->get_param('nasa_id'))),
        'instagram_handle' => sanitize_text_field((string) $request->get_param('instagram_handle')),
        'discord_username' => sanitize_text_field((string) $request->get_param('discord_username')),
        'platform'         => sanitize_key((string) $request->get_param('platform')),
    ];
}

function rpr_validate_registration_fields($fields) {
    if (!$fields['first_name'] || !$fields['last_name'] || !$fields['call_sign'] ||
        !$fields['city'] || !$fields['state'] || !$fields['country']) {
        return new WP_Error('rpr_required_fields', 'Please fill in all required fields.', ['status' => 400]);
    }

    if (!is_email($fields['email'])) {
        return new WP_Error('rpr_invalid_email', 'Please enter a valid email address.', ['status' => 400]);
    }

    return true;
}

function rpr_find_registration_by_email($email) {
    $posts = get_posts([
        'post_type'      => 'rpr_registration',
        'post_status'    => 'any',
        'meta_key'       => 'email',
        'meta_value'     => $email,
        'fields'         => 'ids',
        'posts_per_page' => 1,
    ]);

    return $posts ? (int) $posts[0] : 0;
}

function rpr_save_registration_fields($post_id, $fields) {
    foreach ($fields as $key => $value) {
        update_post_meta($post_id, $key, $value);
    }

    update_post_meta($post_id, 'full_name', trim($fields['first_name'] . ' ' . $fields['last_name']));
    update_post_meta($post_id, 'address', trim($fields['city'] . ', ' . $fields['state'] . ', ' . $fields['country']));
}

function rpr_register_user(WP_REST_Request $request) {
    $fields = rpr_get_registration_fields($request);
    $valid = rpr_validate_registration_fields($fields);

    if (is_wp_error($valid)) {
        return $valid;
    }

    $existing_id = rpr_find_registration_by_email($fields['email']);
    $post_data = [
        'post_type'   => 'rpr_registration',
        'post_status' => 'publish',
        'post_title'  => sprintf('%s <%s>', trim($fields['first_name'] . ' ' . $fields['last_name']), $fields['email']),
    ];

    if ($existing_id) {
        $post_data['ID'] = $existing_id;
        $post_id = wp_update_post($post_data, true);
    } else {
        $post_id = wp_insert_post($post_data, true);
    }

    if (is_wp_error($post_id)) {
        return new WP_Error('rpr_save_failed', 'Could not save registration.', ['status' => 500]);
    }

    rpr_save_registration_fields($post_id, $fields);
    if (!get_post_meta($post_id, 'registered_at', true)) {
        update_post_meta($post_id, 'registered_at', current_time('mysql'));
    }

    return new WP_REST_Response([
        'success' => true,
        'message' => $existing_id ? 'Registration updated.' : 'Registration saved.',
        'id'      => (int) $post_id,
    ], 200);
}

function rpr_update_account(WP_REST_Request $request) {
    $current_email = sanitize_email((string) $request->get_param('current_email'));
    $current_call_sign = sanitize_text_field((string) $request->get_param('current_call_sign'));
    $current_nasa_id = strtoupper(sanitize_text_field((string) $request->get_param('current_nasa_id')));

    if (!is_email($current_email) || !$current_call_sign) {
        return new WP_Error('rpr_identity_missing', 'Saved account verification details are missing. Please register again or contact support.', ['status' => 400]);
    }

    $post_id = rpr_find_registration_by_email($current_email);
    if (!$post_id) {
        return new WP_Error('rpr_account_not_found', 'We could not find your existing registration. Please contact support.', ['status' => 404]);
    }

    $saved_call_sign = (string) get_post_meta($post_id, 'call_sign', true);
    $saved_nasa_id = strtoupper((string) get_post_meta($post_id, 'nasa_id', true));

    // Match the previous saved details before allowing an update.
    if (strcasecmp($saved_call_sign, $current_call_sign) !== 0 ||
        strcasecmp($saved_nasa_id, $current_nasa_id) !== 0) {
        return new WP_Error('rpr_identity_mismatch', 'Account verification failed. Please check your saved account details.', ['status' => 403]);
    }

    $fields = rpr_get_registration_fields($request);
    $valid = rpr_validate_registration_fields($fields);
    if (is_wp_error($valid)) {
        return $valid;
    }

    $post_data = [
        'ID'         => $post_id,
        'post_title' => sprintf('%s <%s>', trim($fields['first_name'] . ' ' . $fields['last_name']), $fields['email']),
    ];
    $updated_post_id = wp_update_post($post_data, true);

    if (is_wp_error($updated_post_id)) {
        return new WP_Error('rpr_update_failed', 'Could not update your account. Please try again.', ['status' => 500]);
    }

    rpr_save_registration_fields($post_id, $fields);
    update_post_meta($post_id, 'account_updated_at', current_time('mysql'));

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Account details updated successfully.',
        'id'      => $post_id,
    ], 200);
}
