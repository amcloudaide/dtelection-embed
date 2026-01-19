/**
 * dtElection Poll Embed
 * Renders and handles voting for embedded dtElection polls
 * Version: 1.6.0
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

        // Hero image (if available)
        if (poll.image_url) {
            var heroImg = document.createElement('img');
            heroImg.className = 'dte-hero-image';
            heroImg.src = poll.image_url;
            heroImg.alt = poll.title || 'Poll image';
            heroImg.loading = 'lazy';
            pollDiv.appendChild(heroImg);
        }

        // Header
        var header = document.createElement('div');
        header.className = 'dte-header';

        var title = document.createElement('h3');
        title.className = 'dte-title';
        title.textContent = poll.title;
        header.appendChild(title);

        // Brand (conditionally shown based on show_branding flag)
        if (poll.show_branding !== false) {
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
        }

        pollDiv.appendChild(header);

        // Description
        if (poll.description) {
            var desc = document.createElement('p');
            desc.className = 'dte-desc';
            desc.textContent = poll.description;
            pollDiv.appendChild(desc);
        }

        // Location (if available)
        if (poll.location_text) {
            var locationDiv = document.createElement('div');
            locationDiv.className = 'dte-location';

            var locationIcon = document.createElement('span');
            locationIcon.className = 'dte-location-icon';
            locationIcon.textContent = '\uD83D\uDCCD'; // Pin emoji (📍)
            locationDiv.appendChild(locationIcon);

            // If we have coordinates, make it a link to Google Maps
            if (poll.location_lat && poll.location_lng) {
                var locationLink = document.createElement('a');
                locationLink.className = 'dte-location-link';
                locationLink.href = 'https://www.google.com/maps/search/?api=1&query=' +
                    encodeURIComponent(poll.location_lat + ',' + poll.location_lng);
                locationLink.target = '_blank';
                locationLink.rel = 'noopener noreferrer';
                locationLink.textContent = poll.location_text;
                locationDiv.appendChild(locationLink);
            } else {
                var locationText = document.createElement('span');
                locationText.className = 'dte-location-text';
                locationText.textContent = poll.location_text;
                locationDiv.appendChild(locationText);
            }

            pollDiv.appendChild(locationDiv);
        }

        // External link (if available - Enterprise feature)
        if (poll.external_link_url) {
            var extLinkDiv = document.createElement('div');
            extLinkDiv.className = 'dte-external-link';

            var extLinkIcon = document.createElement('span');
            extLinkIcon.className = 'dte-external-link-icon';
            extLinkIcon.textContent = '\uD83D\uDD17'; // Link emoji (🔗)
            extLinkDiv.appendChild(extLinkIcon);

            var extLink = document.createElement('a');
            extLink.className = 'dte-external-link-url';
            extLink.href = poll.external_link_url;
            extLink.target = '_blank';
            extLink.rel = 'noopener noreferrer';
            // Show just the domain
            try {
                var url = new URL(poll.external_link_url);
                extLink.textContent = url.hostname;
            } catch (e) {
                extLink.textContent = 'More info';
            }
            extLinkDiv.appendChild(extLink);

            pollDiv.appendChild(extLinkDiv);
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

        var settings = poll.settings || {};
        var allowMaybe = settings.allow_maybe !== false; // Default true
        var singleSelection = settings.single_selection === true;
        var requireEmail = settings.require_email === true;

        // Name input
        var nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.placeholder = 'Your name';
        nameInput.required = true;
        nameInput.className = 'dte-input';
        form.appendChild(nameInput);

        // Email input (if required)
        if (requireEmail) {
            var emailInput = document.createElement('input');
            emailInput.type = 'email';
            emailInput.name = 'email';
            emailInput.placeholder = 'Your email (required)';
            emailInput.required = true;
            emailInput.className = 'dte-input';
            form.appendChild(emailInput);
        }

        // Options container
        var optionsDiv = document.createElement('div');
        optionsDiv.className = 'dte-options';

        var items = poll.poll_type === 'when' ? poll.time_slots : poll.options;
        var isWhen = poll.poll_type === 'when';

        if (items && items.length > 0) {
            // If allow_maybe is enabled, use Yes/Maybe/No buttons for each option
            if (allowMaybe && !singleSelection) {
                items.forEach(function(item) {
                    var optionRow = document.createElement('div');
                    optionRow.className = 'dte-option-row';
                    optionRow.dataset.itemId = item.id;
                    optionRow.dataset.response = ''; // no selection yet

                    var labelSpan = document.createElement('span');
                    labelSpan.className = 'dte-option-label';
                    labelSpan.textContent = isWhen ? formatTimeSlot(item) : item.label;
                    optionRow.appendChild(labelSpan);

                    var buttonsDiv = document.createElement('div');
                    buttonsDiv.className = 'dte-vote-buttons';

                    // Yes button
                    var yesBtn = document.createElement('button');
                    yesBtn.type = 'button';
                    yesBtn.className = 'dte-vote-btn dte-vote-yes';
                    yesBtn.textContent = 'Yes';
                    yesBtn.dataset.response = 'yes';
                    yesBtn.addEventListener('click', function() {
                        handleVoteButtonClick(optionRow, 'yes');
                    });
                    buttonsDiv.appendChild(yesBtn);

                    // Maybe button
                    var maybeBtn = document.createElement('button');
                    maybeBtn.type = 'button';
                    maybeBtn.className = 'dte-vote-btn dte-vote-maybe';
                    maybeBtn.textContent = 'Maybe';
                    maybeBtn.dataset.response = 'maybe';
                    maybeBtn.addEventListener('click', function() {
                        handleVoteButtonClick(optionRow, 'maybe');
                    });
                    buttonsDiv.appendChild(maybeBtn);

                    // No button
                    var noBtn = document.createElement('button');
                    noBtn.type = 'button';
                    noBtn.className = 'dte-vote-btn dte-vote-no';
                    noBtn.textContent = 'No';
                    noBtn.dataset.response = 'no';
                    noBtn.addEventListener('click', function() {
                        handleVoteButtonClick(optionRow, 'no');
                    });
                    buttonsDiv.appendChild(noBtn);

                    optionRow.appendChild(buttonsDiv);
                    optionsDiv.appendChild(optionRow);
                });
            } else {
                // Simple checkbox/radio mode (single_selection or no maybe)
                items.forEach(function(item) {
                    var label = document.createElement('label');
                    label.className = 'dte-option';

                    var input = document.createElement('input');
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
            handleVote(form, token, container, singleSelection, allowMaybe, requireEmail);
        });

        pollDiv.appendChild(form);
    }

    /**
     * Handle vote button click (for Yes/Maybe/No mode)
     */
    function handleVoteButtonClick(optionRow, response) {
        var currentResponse = optionRow.dataset.response;
        var buttons = optionRow.querySelectorAll('.dte-vote-btn');

        // Toggle off if clicking the same button
        if (currentResponse === response) {
            optionRow.dataset.response = '';
            buttons.forEach(function(btn) {
                btn.classList.remove('active');
            });
        } else {
            optionRow.dataset.response = response;
            buttons.forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.dataset.response === response) {
                    btn.classList.add('active');
                }
            });
        }
    }

    /**
     * Render results with bars (for closed polls or after voting)
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
        var allowMaybe = poll.settings && poll.settings.allow_maybe !== false;

        if (items && items.length > 0) {
            // Count votes per item (yes and maybe separately)
            var yesCounts = {};
            var maybeCounts = {};
            var maxVotes = 0;

            items.forEach(function(item) {
                yesCounts[item.id] = 0;
                maybeCounts[item.id] = 0;
            });

            // Count votes from participants
            if (poll.participants && poll.participants.length > 0) {
                poll.participants.forEach(function(participant) {
                    if (participant.votes) {
                        participant.votes.forEach(function(vote) {
                            if (vote.response === 'yes' && yesCounts.hasOwnProperty(vote.slot_id)) {
                                yesCounts[vote.slot_id]++;
                                var total = yesCounts[vote.slot_id] + (maybeCounts[vote.slot_id] * 0.5);
                                if (total > maxVotes) maxVotes = total;
                            } else if (vote.response === 'maybe' && maybeCounts.hasOwnProperty(vote.slot_id)) {
                                maybeCounts[vote.slot_id]++;
                                var total = yesCounts[vote.slot_id] + (maybeCounts[vote.slot_id] * 0.5);
                                if (total > maxVotes) maxVotes = total;
                            }
                        });
                    }
                });
            }

            // Render each item with bar
            items.forEach(function(item) {
                var yesCount = yesCounts[item.id] || 0;
                var maybeCount = maybeCounts[item.id] || 0;
                var effectiveTotal = yesCount + (maybeCount * 0.5);
                var percentage = maxVotes > 0 ? (effectiveTotal / maxVotes) * 100 : 0;

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
                if (effectiveTotal === maxVotes && maxVotes > 0) {
                    bar.className += ' dte-leading';
                }
                bar.style.width = percentage + '%';
                barWrap.appendChild(bar);

                var countSpan = document.createElement('span');
                countSpan.className = 'dte-result-count';
                if (allowMaybe && maybeCount > 0) {
                    countSpan.textContent = yesCount + ' yes, ' + maybeCount + ' maybe';
                } else {
                    countSpan.textContent = yesCount;
                }
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
    function handleVote(form, token, container, singleSelection, allowMaybe, requireEmail) {
        var nameInput = form.querySelector('input[name="name"]');
        var name = nameInput.value.trim();

        if (!name) {
            alert('Please enter your name');
            return;
        }

        // Check email if required
        var email = null;
        if (requireEmail) {
            var emailInput = form.querySelector('input[name="email"]');
            email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                alert('Please enter your email');
                return;
            }
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address');
                return;
            }
        }

        var votes = [];

        // Check if using Yes/Maybe/No buttons mode
        var optionRows = form.querySelectorAll('.dte-option-row[data-response]');
        if (optionRows.length > 0) {
            // Yes/Maybe/No button mode
            optionRows.forEach(function(row) {
                var response = row.dataset.response;
                var itemId = row.dataset.itemId;
                if (response && response !== '') {
                    votes.push({
                        slot_id: itemId,
                        response: response
                    });
                }
            });
        } else {
            // Checkbox/Radio mode
            var selectedInputs;
            if (singleSelection) {
                selectedInputs = form.querySelectorAll('input[name="vote-single"]:checked');
            } else {
                selectedInputs = form.querySelectorAll('input[name="vote"]:checked');
            }

            selectedInputs.forEach(function(input) {
                votes.push({
                    slot_id: input.value,
                    response: 'yes'
                });
            });
        }

        if (votes.length === 0) {
            alert('Please select at least one option');
            return;
        }

        var submitBtn = form.querySelector('.dte-submit');
        var originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        var requestBody = {
            name: name,
            votes: votes
        };
        if (email) {
            requestBody.email = email;
        }

        fetch(API_URL + '/' + encodeURIComponent(token) + '/vote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(function(response) {
            if (!response.ok) {
                return response.json().then(function(data) {
                    throw new Error(data.error?.message || 'Vote failed');
                });
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
            alert(error.message || 'Could not submit vote. Please try again.');
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
