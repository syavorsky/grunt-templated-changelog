
# <%= version %>

<% commits.forEach(function(commit) { %>- <% if (commit.label) { %>`<%= commit.label %>` <% } %><%= commit.subject %> `<%= commit.hash_abbr %>`
<% }); %>