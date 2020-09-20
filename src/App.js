import React, { useState } from 'react'
import './App.css'
import Graph from 'react-graph-vis'
import { v4 as uuidv4 } from 'uuid'

const max_size = 101

function App() {
  let nodes = [
    { id: 1, label: '1', title: '1', color: 'lightgrey' },
    { id: 2, label: '2', title: '2', color: 'lightgrey' },
    { id: 3, label: '3', title: '3', color: 'lightgrey' },
    { id: 4, label: '4', title: '4', color: 'lightgrey' },
    { id: 5, label: '5', title: '5', color: 'lightgrey' },
  ]

  let edges = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 4, to: 5 },
  ]

  let default_graph = {
    edges: edges,
    nodes: nodes,
  }

  let [n, setN] = useState(nodes.length)
  let [graph, setGraph] = useState(default_graph)
  let [graph_key, setGraphKey] = useState(uuidv4)
  let [user_input, setUserInput] = useState('5 3\n1 2\n1 3\n4 5')

  const options = {
    layout: {
      hierarchical: false,
    },
    edges: {
      color: '#000000',
    },
    height: '500px',
  }

  const events = {
    select: function (event) {
      let { nodes, edges } = event
    },
  }

  function handleChange(event) {
    setUserInput(event.target.value)
  }

  function drawGraph(event) {
    /** read in the input from the user */
    let raw_input = user_input

    if (raw_input === '') return

    let input = raw_input.split('\n')
    let n = parseInt(input[0])

    // limit number of nodes to max_size
    if (n > max_size) return

    /** construct the new graph based on the  */
    let new_graph = { nodes: [], edges: [] }

    // create nodes
    for (let i = 1; i <= n; i++) {
      let node = {
        id: i,
        label: `${i}`,
        color: 'lightgrey',
      }
      new_graph.nodes.push(node)
    }

    for (let i = 1; i < input.length; i++) {
      let nodes = input[i].split(' ')

      let edge

      if (nodes.length == 2) edge = { from: nodes[0], to: nodes[1] }
      else if (nodes.length == 1) edge = { from: nodes[0] }

      new_graph.edges.push(edge)
    }

    setGraphKey(uuidv4)
    setN(n)
    setGraph(new_graph)
  }

  function colorGraph(event) {
    /** These variables will be used by the DFS algorithm to traverse the graph */
    let adj = new Array(n + 1)

    for (let i = 0; i <= n; i++) {
      adj[i] = new Array()
    }

    let color_one = new Array(n + 1).fill(false)
    let color_two = new Array(n + 1).fill(false)
    let visited = new Array(n + 1).fill(false)
    let result = true

    /** convert the graph into an adjacency list representation */
    for (const x in graph.edges) {
      let start = graph.edges[x].from
      let end = graph.edges[x].to
      if (typeof end !== 'undefined') adj[start].push(end)
    }

    /** This traverses the graph and checks if a bipartite coloring is possible */
    function dfs(start, color) {
      visited[start] = true

      if (color === 1) color_one[start] = true
      else color_two[start] = true

      for (const x in adj[start]) {
        let node_num = adj[start][x]

        if (!result) return

        if (visited[node_num]) {
          if (color === 1 && color_one[node_num]) {
            result = false
            return
          }

          if (color === 2 && color_two[node_num]) {
            result = false
            return
          }

          continue
        }

        let child_color

        if (color === 1) child_color = 2
        else child_color = 1

        dfs(node_num, child_color)
      }
    }

    /** This returns true if the graph can be colored, false otherwise */
    function check() {
      for (let i = 1; i <= n; i++) {
        if (visited[i]) continue
        dfs(i, 1)
        if (!result) return false
      }

      return true
    }

    /** this colors the nodes if in a bipartite configuration if possible, all red otherwise */
    function setNodeColor(check_result) {
      for (const x in graph.nodes) {
        let node = graph.nodes[x]

        if (check_result)
          color_one[node.id]
            ? (node['color'] = 'green')
            : (node['color'] = 'orange')
        else node['color'] = 'red'
      }
      setGraphKey(uuidv4)
      setGraph(graph)
    }

    setNodeColor(check())
  }

  return (
    <div>
      <nav>
        <a href="https://fazalkhan.net/"> back to Fazi's Homepage</a>
      </nav>
      <div className="title">Bipartite Graph Coloring</div>
      <div className="App">
        <textarea
          value={user_input}
          id="user-input"
          className="inputs"
          onChange={handleChange}
        ></textarea>
        <div className="graph-container">
          <Graph
            key={graph_key}
            graph={graph}
            options={options}
            events={events}
            getNetwork={(network) => {}}
          />
        </div>
        <div className="description">
          <p>
            This app uses Depth-First Search to color a graph, such that no two
            connected nodes have the same color. The source code can be found{' '}
            <a href="https://github.com/acse-fk4517/bipartite-coloring">here</a>
            .
          </p>
          <p>
            1. On the first line, enter <b>N</b> and <b>M</b>. <br></br>
            <ul>
              <li>
                <b>N</b> is the number of nodes that will be drawn. Nodes are
                drawn numbered 1,...,<b>N</b>. <br></br>
              </li>
              <br></br>
              <li>
                <b>M</b> is the number of lines that follow, which specify the
                edges. <br></br>
              </li>
              <br></br>
              <li>
                Edges are specifed as <b>start</b> <b>end</b>.<br></br>
              </li>
            </ul>
            <br></br>
            2. Click <b>Draw Graph</b> to create your graph. <br></br> <br></br>
            <br></br>
            3. Click <b>Color Graph</b> to see the bipartite coloring of the
            graph. <br></br>
            <ul>
              <li>
                If a solution exists, the graph will be colored in a bipartite
                configuration.
              </li>
              <br></br>
              <li>If a solution does not exist, all nodes will turn red.</li>
            </ul>
          </p>
          <div className="button-container">
            <button onClick={drawGraph}>Draw Graph</button>
            <button onClick={colorGraph}>Color Graph</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
