<?php
/**
 * Plugin Name: ChatGPT UTM Cleaner
 * Description: Removes the `utm_source=chatgpt.com` tracking parameter from links in WordPress post content.
 * Version: 1.0.0
 * Author: OpenAI ChatGPT
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Removes the `utm_source=chatgpt.com` parameter from a URL.
 *
 * @param string $url Original URL.
 *
 * @return string Sanitized URL.
 */
function chatgpt_utm_cleaner_strip_param( string $url ): string {
    if ( '' === $url || false === strpos( $url, 'utm_source=chatgpt.com' ) ) {
        return $url;
    }

    $parts = wp_parse_url( $url );

    if ( empty( $parts ) || empty( $parts['query'] ) ) {
        return $url;
    }

    parse_str( $parts['query'], $query_vars );

    if ( empty( $query_vars['utm_source'] ) || 'chatgpt.com' !== $query_vars['utm_source'] ) {
        return $url;
    }

    unset( $query_vars['utm_source'] );

    $query = http_build_query( $query_vars, '', '&', PHP_QUERY_RFC3986 );

    $rebuilt = '';

    if ( isset( $parts['scheme'] ) ) {
        $rebuilt .= $parts['scheme'] . '://';
    } elseif ( 0 === strpos( $url, '//' ) ) {
        $rebuilt .= '//';
    }

    if ( isset( $parts['user'] ) ) {
        $rebuilt .= $parts['user'];

        if ( isset( $parts['pass'] ) ) {
            $rebuilt .= ':' . $parts['pass'];
        }

        $rebuilt .= '@';
    }

    if ( isset( $parts['host'] ) ) {
        $rebuilt .= $parts['host'];
    }

    if ( isset( $parts['port'] ) ) {
        $rebuilt .= ':' . $parts['port'];
    }

    if ( isset( $parts['path'] ) ) {
        $rebuilt .= $parts['path'];
    }

    if ( '' !== $query ) {
        $rebuilt .= '?' . $query;
    }

    if ( isset( $parts['fragment'] ) ) {
        $rebuilt .= '#' . $parts['fragment'];
    }

    return $rebuilt;
}

/**
 * Sanitizes anchor tags in post content by removing `utm_source=chatgpt.com`.
 *
 * @param string $content Post content.
 *
 * @return string Filtered content.
 */
function chatgpt_utm_cleaner_filter_content( string $content ): string {
    if ( false === strpos( $content, 'utm_source=chatgpt.com' ) ) {
        return $content;
    }

    $internal_errors = libxml_use_internal_errors( true );

    $dom = new DOMDocument( '1.0', 'UTF-8' );

    $dom->loadHTML( '<?xml encoding="utf-8" ?>' . $content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );

    libxml_clear_errors();
    libxml_use_internal_errors( $internal_errors );

    foreach ( $dom->getElementsByTagName( 'a' ) as $anchor ) {
        /** @var DOMElement $anchor */
        $href = $anchor->getAttribute( 'href' );

        if ( '' === $href ) {
            continue;
        }

        $cleaned = chatgpt_utm_cleaner_strip_param( $href );

        if ( $cleaned !== $href ) {
            $anchor->setAttribute( 'href', $cleaned );
        }
    }

    $filtered = $dom->saveHTML();

    return is_string( $filtered ) ? $filtered : $content;
}

add_filter( 'the_content', 'chatgpt_utm_cleaner_filter_content', 20 );
add_filter( 'widget_text_content', 'chatgpt_utm_cleaner_filter_content', 20 );
add_filter( 'widget_block_content', 'chatgpt_utm_cleaner_filter_content', 20 );
