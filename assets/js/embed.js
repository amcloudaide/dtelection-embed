/**
 * dtElection Poll Embed
 * Renders and handles voting for embedded dtElection polls
 */
(function() {
    'use strict';

    // Get API URL from WordPress localization or use default
    var API_URL = (typeof dtelectionConfig !== 'undefined' && dtelectionConfig.apiUrl)
        ? dtelectionConfig.apiUrl
        : 'https://dtelection.com/api/v1/embed';

    var STORAGE_KEY = 'dtelection_voted_polls';

    /**
     * Check if user has already voted on this poll (localStorage)
     */
    function hasVoted(token) {
        try {
            var voted = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return !!voted[token];
        } catch (e) {
            return false;
        }
    }

    /**
     * Get the name used when voting
     */
    function getVotedName(token) {
        try {
            var voted = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return voted[token] || null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Mark poll as voted in localStorage
     */
    function markAsVoted(token, name) {
        try {
            var voted = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            voted[token] = name;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(voted));
        } catch (e) {
            // localStorage not available, ignore
        }
    }

    /**
     * Initialize all poll containers on the page
     */
    function initPolls() {
        var containers = document.querySelectorAll('.dtelection-poll[data-token]');
        containers.forEach(function(container) {
            if (container.dataset.initialized) return;
            container.dataset.initialized = 'true';
            loadPoll(container);
        });
    }

    /**
     * Load poll data and render
     */
    function loadPoll(container) {
        var token = container.dataset.token;
        if (!token) return;

        showLoading(container);

        fetch(API_URL + '/' + encodeURIComponent(token))
            .then(function(response) {
                if (!response.ok) {
                    if (response.status === 403) {
                        return response.json().then(function(data) {
                            var code = data.error?.code || 'FORBIDDEN';
                            if (code === 'EMBED_DISABLED') {
                                throw new Error('Embedding is disabled for this poll');
                            } else if (code === 'DOMAIN_NOT_ALLOWED') {
                                throw new Error('This poll cannot be embedded on this website');
                            }
                            throw new Error('Access denied');
                        });
                    }
                    throw new Error('Poll not found');
                }
                return response.json();
            })
            .then(function(data) {
                if (data.data) {
                    renderPoll(container, data.data, token);
                } else {
                    renderPoll(container, data, token);
                }
            })
            .catch(function(error) {
                showError(container, error.message || 'Could not load poll');
            });
    }

    /**
     * Show loading state
     */
    function showLoading(container) {
        container.textContent = '';
        var loading = document.createElement('div');
        loading.className = 'dte-loading';
        loading.textContent = 'Loading poll...';
        container.appendChild(loading);
    }

    /**
     * Show error state
     */
    function showError(container, message) {
        container.textContent = '';
        var error = document.createElement('div');
        error.className = 'dte-error';
        error.textContent = message || 'Could not load poll';
        container.appendChild(error);
    }

    /**
     * Render poll UI using safe DOM methods
     */
    function renderPoll(container, poll, token) {
        container.textContent = '';

        var pollDiv = document.createElement('div');
        pollDiv.className = 'dte-poll';

        // Header
        var header = document.createElement('div');
        header.className = 'dte-header';

        var title = document.createElement('h3');
        title.className = 'dte-title';
        title.textContent = poll.title;
        header.appendChild(title);

        var brand = document.createElement('a');
        brand.className = 'dte-brand';
        brand.href = 'https://dtelection.com/poll/' + token;
        brand.target = '_blank';
        brand.rel = 'noopener noreferrer';
        brand.title = 'View on dtElection';

        var brandIcon = document.createElement('img');
        brandIcon.className = 'dte-brand-icon';
        brandIcon.src = (typeof dtelectionConfig !== 'undefined' && dtelectionConfig.pluginUrl)
            ? dtelectionConfig.pluginUrl + 'assets/images/icon.png'
            : 'https://dtelection.com/favicon-16x16.png';
        brandIcon.alt = '';
        brand.appendChild(brandIcon);

        var brandText = document.createTextNode('dtElection');
        brand.appendChild(brandText);
        header.appendChild(brand);

        pollDiv.appendChild(header);

        // Description
        if (poll.description) {
            var desc = document.createElement('p');
            desc.className = 'dte-desc';
            desc.textContent = poll.description;
            pollDiv.appendChild(desc);
        }

        // Check if poll is closed or user already voted
        if (poll.status === 'closed') {
            renderResults(pollDiv, poll, null);
        } else if (hasVoted(token)) {
            renderResults(pollDiv, poll, getVotedName(token));
        } else {
            renderVotingForm(pollDiv, poll, token, container);
        }

        // Footer
        var footer = document.createElement('div');
        footer.className = 'dte-footer';
        var voteCount = poll.vote_count || 0;
        footer.textContent = voteCount + ' vote' + (voteCount !== 1 ? 's' : '');
        pollDiv.appendChild(footer);

        container.appendChild(pollDiv);
    }

    /**
     * Render voting form
     */
    function renderVotingForm(pollDiv, poll, token, container) {
        var form = document.createElement('form');
        form.className = 'dte-form';

        // Name input
        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.placeholder = 'Your name';
        nameInput.required = true;
        nameInput.className = 'dte-input';
        form.appendChild(nameInput);

        // Options container
        var optionsDiv = document.createElement('div');
        optionsDiv.className = 'dte-options';

        var items = poll.poll_type === 'when' ? poll.time_slots : poll.options;
        var isWhen = poll.poll_type === 'when';
        var singleSelection = poll.settings && poll.settings.single_selection;

        if (items && items.length > 0) {
            items.forEach(function(item, index) {
                var label = document.createElement('label');
                label.className = 'dte-option';

                var input = document.createElement('input');
                // Use radio buttons for single selection, checkboxes for multiple
                input.type = singleSelection ? 'radio' : 'checkbox';
                input.name = singleSelection ? 'vote-single' : 'vote';
                input.value = item.id;

                var span = document.createElement('span');
                span.textContent = isWhen ? formatTimeSlot(item) : item.label;

                label.appendChild(input);
                label.appendChild(span);
                optionsDiv.appendChild(label);
            });
        }

        form.appendChild(optionsDiv);

        // Submit button
        var submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'dte-submit';
        submitBtn.textContent = 'Vote';
        form.appendChild(submitBtn);

        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleVote(form, token, container, singleSelection);
        });

        pollDiv.appendChild(form);
    }

    /**
     * Render results with bars (for closed polls or after voting)
     * @param {Element} pollDiv - Container element
     * @param {Object} poll - Poll data with participants and votes
     * @param {string|null} votedAsName - Name user voted as, or null if just viewing closed poll
     */
    function renderResults(pollDiv, poll, votedAsName) {
        var resultsDiv = document.createElement('div');
        resultsDiv.className = 'dte-results';

        // Show closed message if poll is closed
        if (poll.status === 'closed') {
            var closedMsg = document.createElement('p');
            closedMsg.className = 'dte-closed';
            closedMsg.textContent = 'This poll is closed.';
            resultsDiv.appendChild(closedMsg);
        }

        // Get items (time slots or options)
        var items = poll.poll_type === 'when' ? poll.time_slots : poll.options;
        var isWhen = poll.poll_type === 'when';

        if (items && items.length > 0) {
            // Count votes per item
            var voteCounts = {};
            var maxVotes = 0;

            items.forEach(function(item) {
                voteCounts[item.id] = 0;
            });

            // Count 'yes' votes from participants
            if (poll.participants && poll.participants.length > 0) {
                poll.participants.forEach(function(participant) {
                    if (participant.votes) {
                        participant.votes.forEach(function(vote) {
                            if (vote.response === 'yes' && voteCounts.hasOwnProperty(vote.slot_id)) {
                                voteCounts[vote.slot_id]++;
                                if (voteCounts[vote.slot_id] > maxVotes) {
                                    maxVotes = voteCounts[vote.slot_id];
                                }
                            }
                        });
                    }
                });
            }

            // Render each item with bar
            items.forEach(function(item) {
                var count = voteCounts[item.id] || 0;
                var percentage = maxVotes > 0 ? (count / maxVotes) * 100 : 0;

                var barContainer = document.createElement('div');
                barContainer.className = 'dte-result-item';

                var label = document.createElement('div');
                label.className = 'dte-result-label';
                label.textContent = isWhen ? formatTimeSlot(item) : item.label;
                barContainer.appendChild(label);

                var barWrap = document.createElement('div');
                barWrap.className = 'dte-result-bar-wrap';

                var bar = document.createElement('div');
                bar.className = 'dte-result-bar';
                if (count === maxVotes && maxVotes > 0) {
                    bar.className += ' dte-leading';
                }
                bar.style.width = percentage + '%';
                barWrap.appendChild(bar);

                var countSpan = document.createElement('span');
                countSpan.className = 'dte-result-count';
                countSpan.textContent = count;
                barWrap.appendChild(countSpan);

                barContainer.appendChild(barWrap);
                resultsDiv.appendChild(barContainer);
            });
        }

        // Show "You voted as xxx" if applicable
        if (votedAsName) {
            var votedMsg = document.createElement('p');
            votedMsg.className = 'dte-voted-msg';
            votedMsg.textContent = 'You voted as "' + votedAsName + '"';
            resultsDiv.appendChild(votedMsg);
        }

        pollDiv.appendChild(resultsDiv);
    }

    /**
     * Handle vote submission
     */
    function handleVote(form, token, container, singleSelection) {
        var nameInput = form.querySelector('input[name="name"]');
        var name = nameInput.value.trim();

        if (!name) {
            alert('Please enter your name');
            return;
        }

        // Handle both single (radio) and multiple (checkbox) selection
        var selectedInputs;
        if (singleSelection) {
            selectedInputs = form.querySelectorAll('input[name="vote-single"]:checked');
        } else {
            selectedInputs = form.querySelectorAll('input[name="vote"]:checked');
        }

        if (selectedInputs.length === 0) {
            alert('Please select ' + (singleSelection ? 'an option' : 'at least one option'));
            return;
        }

        var votes = [];
        selectedInputs.forEach(function(input) {
            votes.push({
                slot_id: input.value,
                response: 'yes'
            });
        });

        var submitBtn = form.querySelector('.dte-submit');
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        fetch(API_URL + '/' + encodeURIComponent(token) + '/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                votes: votes
            })
        })
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Vote failed');
            }
            return response.json();
        })
        .then(function(data) {
            // Mark as voted in localStorage
            markAsVoted(token, name);
            // Show success and reload poll
            showSuccess(container, 'Vote recorded!');
            setTimeout(function() {
                container.dataset.initialized = '';
                loadPoll(container);
            }, 1500);
        })
        .catch(function(error) {
            alert('Could not submit vote. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    /**
     * Show success message
     */
    function showSuccess(container, message) {
        container.textContent = '';
        var success = document.createElement('div');
        success.className = 'dte-success';
        success.textContent = message;
        container.appendChild(success);
    }

    /**
     * Format time slot for display
     */
    function formatTimeSlot(slot) {
        try {
            var start = new Date(slot.start_time);
            var end = new Date(slot.end_time);

            var dateOpts = { weekday: 'short', month: 'short', day: 'numeric' };
            var timeOpts = { hour: '2-digit', minute: '2-digit' };

            var dateStr = start.toLocaleDateString(undefined, dateOpts);
            var startTime = start.toLocaleTimeString(undefined, timeOpts);
            var endTime = end.toLocaleTimeString(undefined, timeOpts);

            return dateStr + ' ' + startTime + ' - ' + endTime;
        } catch (e) {
            return slot.start_time + ' - ' + slot.end_time;
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPolls);
    } else {
        initPolls();
    }

    // Also check for dynamically added polls
    if (typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    initPolls();
                }
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
