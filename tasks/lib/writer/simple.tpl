
# <%= version %>

<% commits.forEach(function(commit) { %>- <%= commit.subject %> `<%= commit.hash_abbr %>`
<% }); %>