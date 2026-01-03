/**
 * dtElection Poll Block
 * Gutenberg block for embedding dtElection polls
 */
(function(wp) {
    'use strict';

    var registerBlockType = wp.blocks.registerBlockType;
    var createElement = wp.element.createElement;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var TextControl = wp.components.TextControl;
    var Placeholder = wp.components.Placeholder;
    var Button = wp.components.Button;

    /**
     * Extract token from URL or return as-is
     */
    function extractToken(input) {
        if (!input) return '';
        input = input.trim();
        var match = input.match(/poll\/([a-zA-Z0-9]+)/);
        return match ? match[1] : input;
    }

    /**
     * Edit component
     */
    function EditBlock(props) {
        var attributes = props.attributes;
        var setAttributes = props.setAttributes;
        var token = attributes.token;
        var blockProps = useBlockProps();

        // No token - show placeholder with input
        if (!token) {
            return createElement(
                'div',
                blockProps,
                createElement(
                    Placeholder,
                    {
                        icon: 'chart-bar',
                        label: 'dtElection Poll',
                        instructions: 'Enter your poll token or paste the full poll URL from dtelection.com'
                    },
                    createElement(TextControl, {
                        placeholder: 'abc123 or https://dtelection.com/poll/abc123',
                        onChange: function(value) {
                            setAttributes({ token: extractToken(value) });
                        }
                    })
                )
            );
        }

        // Has token - show preview
        return createElement(
            'div',
            blockProps,
            createElement(
                'div',
                { className: 'dte-poll dte-preview', style: {
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    background: '#fff',
                    maxWidth: '480px'
                }},
                createElement(
                    'div',
                    { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }},
                    createElement('span', { style: { fontWeight: '600', color: '#1e293b' }}, 'Poll: ' + token),
                    createElement('span', { style: {
                        fontSize: '11px',
                        color: '#94a3b8',
                        padding: '2px 8px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px'
                    }}, 'dtElection')
                ),
                createElement('p', { style: { color: '#64748b', fontSize: '14px', margin: '0 0 12px 0' }},
                    'Poll will load on the frontend'
                ),
                createElement(
                    Button,
                    {
                        variant: 'link',
                        onClick: function() {
                            setAttributes({ token: '' });
                        },
                        style: { padding: 0 }
                    },
                    'Change poll'
                )
            )
        );
    }

    /**
     * Register block
     */
    registerBlockType('dtelection/poll', {
        edit: EditBlock,
        save: function() {
            // Dynamic block - rendered by PHP
            return null;
        }
    });

})(window.wp);
