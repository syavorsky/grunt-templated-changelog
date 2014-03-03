
# <%= version %>

<% commits.forEach(function(commit) { %>- <% if (commit.marker) { %>[marker: <%= commit.marker %>] <% } %><%= commit.subject %> `<%= commit.hash_abbr %>`
<% }); %>