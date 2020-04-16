const db_scripts = require('./dbScripts.js');
const concat = require('concat');

async function create_table(given) {
  var html ='';
  var res ='';
  var i = 0;
  let db_given = await db_scripts.db_find_api();
  console.log(db_given);
  res = res.concat('<nav class="pagination is-centered" role="navigation" aria-label="pagination"> <a class="pagination-previous">Previous</a> <a class="pagination-next">Next page</a> <ul class="pagination-list">');
  res = res.concat('<li> <a class="pagination-link is-current" aria-label="Page 1" aria-current="page">1</a>');
  res = res.concat('<li><a class="pagination-link" aria-label="Goto page 2">2</a></li><li><a class="pagination-link" aria-label="Goto page 3">3</a></li>');
  res = res.concat('</li></ul></nav>');
  res = res.concat('<table class="table"> <thead> <tr> <th><abbr title="Name">Name</abbr></th> <th>Button</th></tr></thead><tbody>');
  db_given.forEach(function(element) {
    console.log(element.name);
    try {
      res = res.concat('<tr><td>', String(element.name), '</td> <td><form action="' + String(element.callback)+'" method="GET"><button class = "button">Login</button></form></td></tr>');

    } catch(e) {
      console.log(e);
    }
  i++;
  });
  return res;
}

exports.create_table = create_table;
