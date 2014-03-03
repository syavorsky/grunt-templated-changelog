
# <%= version %>

<% commits.forEach(function(section) { %><% if (section.label) { %>## <%= section.label %><% } %>
<% section.commits.forEach(function(section) { %><% if (section.target) { %>### <%= section.target %><% } %>
<% section.commits.forEach(function(commit) { %>- <%= commit.subject %> `<%= commit.hash_abbr %>`
<% }); %>
<% }); %><% }); %>

<% if (breaking_changes.length) { %>## Breaking changes
<% breaking_changes.forEach(function(change) { %>
<%= change %>
<% }); %><% } %>