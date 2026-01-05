---
title: "Graph Traversal Algorithms"
date: 2026-01-05
draft: false
---

# Graph Traversal Algorithms

Graph traversal algorithms are techniques for visiting all vertices in a graph systematically. These fundamental algorithms form the basis for many complex graph operations and are essential tools in every programmer's toolkit.

## What is Graph Traversal?

**Graph traversal** is the process of visiting each vertex in a graph exactly once. The order in which vertices are visited defines the traversal algorithm. The two most fundamental traversal algorithms are:

1. **Depth-First Search (DFS)**
2. **Breadth-First Search (BFS)**

## Depth-First Search (DFS)

**Depth-First Search** explores a graph by going as deep as possible along each branch before backtracking.

### Algorithm Description

DFS uses a **stack** (or recursion) to keep track of vertices to visit. The algorithm:

1. Start at a source vertex
2. Mark it as visited
3. Recursively visit all unvisited adjacent vertices
4. Backtrack when no unvisited adjacent vertices remain

### Pseudocode

```
DFS(graph, start_vertex):
    create a stack S
    mark start_vertex as visited
    push start_vertex onto S
    
    while S is not empty:
        vertex = pop from S
        process(vertex)
        
        for each neighbor of vertex:
            if neighbor is not visited:
                mark neighbor as visited
                push neighbor onto S
```

### Recursive Implementation

```python
def dfs_recursive(graph, vertex, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(vertex)
    process(vertex)
    
    for neighbor in graph[vertex]:
        if neighbor not in visited:
            dfs_recursive(graph, neighbor, visited)
    
    return visited
```

### Time and Space Complexity

- **Time Complexity**: O(V + E)
  - V = number of vertices
  - E = number of edges
  - We visit each vertex once and explore each edge once

- **Space Complexity**: O(V)
  - For the visited set
  - O(V) for recursion stack in worst case (linear graph)

### Characteristics of DFS

- **Explores depth-first**: Goes as far as possible before backtracking
- **Uses stack/recursion**: Naturally recursive or uses explicit stack
- **Memory efficient**: Uses less memory than BFS for wide graphs
- **Path finding**: Can find a path, but not necessarily the shortest

### Applications of DFS

1. **Cycle Detection**: Detect cycles in directed and undirected graphs
2. **Topological Sorting**: Order vertices in a DAG
3. **Connected Components**: Find all connected components
4. **Path Finding**: Find any path between two vertices
5. **Maze Solving**: Explore all possible paths
6. **Strongly Connected Components**: Find SCCs using Kosaraju's or Tarjan's algorithm
7. **Bipartite Graph Testing**: Check if a graph is bipartite
8. **Puzzle Solving**: Solve puzzles with state-space search

### DFS Traversal Example

```
Graph:      A --- B
            |     |
            C --- D

DFS from A: A → C → D → B
(assuming alphabetical order for neighbors)
```

## Breadth-First Search (BFS)

**Breadth-First Search** explores a graph level by level, visiting all neighbors before moving to the next level.

### Algorithm Description

BFS uses a **queue** to keep track of vertices to visit. The algorithm:

1. Start at a source vertex
2. Mark it as visited and enqueue it
3. Dequeue a vertex and visit all its unvisited neighbors
4. Enqueue all unvisited neighbors
5. Repeat until the queue is empty

### Pseudocode

```
BFS(graph, start_vertex):
    create a queue Q
    mark start_vertex as visited
    enqueue start_vertex into Q
    
    while Q is not empty:
        vertex = dequeue from Q
        process(vertex)
        
        for each neighbor of vertex:
            if neighbor is not visited:
                mark neighbor as visited
                enqueue neighbor into Q
```

### Implementation

```python
from collections import deque

def bfs(graph, start_vertex):
    visited = set()
    queue = deque([start_vertex])
    visited.add(start_vertex)
    
    while queue:
        vertex = queue.popleft()
        process(vertex)
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return visited
```

### Time and Space Complexity

- **Time Complexity**: O(V + E)
  - V = number of vertices
  - E = number of edges
  - We visit each vertex once and explore each edge once

- **Space Complexity**: O(V)
  - For the queue and visited set
  - In worst case, queue can contain all vertices of a level

### Characteristics of BFS

- **Explores level by level**: Visits all vertices at distance k before distance k+1
- **Uses queue**: Iterative approach with queue data structure
- **Shortest path**: Finds shortest path in unweighted graphs
- **Memory intensive**: Can use more memory than DFS for deep graphs

### Applications of BFS

1. **Shortest Path**: Find shortest path in unweighted graphs
2. **Level Order Traversal**: Process nodes level by level
3. **Web Crawling**: Systematically explore web pages
4. **Social Network Analysis**: Find degrees of separation
5. **Broadcasting**: Efficient message broadcasting in networks
6. **GPS Navigation**: Find nearby locations
7. **Peer-to-Peer Networks**: Locate nearby peers
8. **Garbage Collection**: Mark-and-sweep garbage collection

### BFS Traversal Example

```
Graph:      A --- B
            |     |
            C --- D

BFS from A: A → B → C → D
(level 0: A, level 1: B and C, level 2: D)
```

## DFS vs BFS Comparison

| Aspect | DFS | BFS |
|--------|-----|-----|
| **Data Structure** | Stack (or recursion) | Queue |
| **Exploration** | Depth-first | Level by level |
| **Memory** | O(h) where h is height | O(w) where w is width |
| **Shortest Path** | No | Yes (unweighted graphs) |
| **Implementation** | Recursive or iterative | Iterative |
| **Best For** | Deep graphs, cycle detection | Shallow graphs, shortest path |
| **Completeness** | Not guaranteed in infinite graphs | Guaranteed in finite graphs |

## When to Use DFS

Use DFS when:
- You need to explore all paths
- You're looking for any solution, not the shortest
- The graph is very wide and shallow
- You need to detect cycles
- You need topological sorting
- Memory is a constraint and the graph is wide

## When to Use BFS

Use BFS when:
- You need the shortest path in an unweighted graph
- You want to explore nearby nodes first
- The graph is very deep
- You need to find all nodes at a certain distance
- You're implementing level-order processing

## Variations and Extensions

### 1. Bidirectional Search

Search from both start and goal simultaneously to reduce search space.

### 2. Iterative Deepening DFS

Combines benefits of DFS and BFS by performing DFS with increasing depth limits.

### 3. Uniform Cost Search

Extension of BFS for weighted graphs, uses priority queue.

### 4. A* Search

Informed search algorithm that uses heuristics to guide the search.

## Implementation Considerations

### Marking Visited Vertices

- **Set/HashSet**: O(1) lookup, good for sparse graphs
- **Boolean Array**: O(1) lookup, good when vertices are numbered 0 to n-1
- **Color-based**: Three colors (white, gray, black) for more detailed tracking

### Handling Disconnected Graphs

```python
def dfs_all(graph):
    visited = set()
    
    for vertex in graph:
        if vertex not in visited:
            dfs(graph, vertex, visited)
```

### Tracking Parents

To reconstruct paths, maintain a parent mapping:

```python
def bfs_with_path(graph, start, goal):
    visited = {start}
    queue = deque([start])
    parent = {start: None}
    
    while queue:
        vertex = queue.popleft()
        
        if vertex == goal:
            return reconstruct_path(parent, start, goal)
        
        for neighbor in graph[vertex]:
            if neighbor not in visited:
                visited.add(neighbor)
                parent[neighbor] = vertex
                queue.append(neighbor)
    
    return None  # No path found
```

## Practice Problems

1. **Island Counting**: Count connected components using DFS
2. **Shortest Path in Maze**: Use BFS to find shortest path
3. **Cycle Detection**: Detect cycles using DFS
4. **Word Ladder**: Transform one word to another using BFS
5. **Clone Graph**: Deep copy a graph using DFS or BFS

## Next Steps

- Explore [Shortest Path Algorithms]({{< ref "shortest-path" >}}) for weighted graphs
- Learn about [Applications]({{< ref "applications" >}}) of graph traversal
- Study advanced topics like topological sorting and strongly connected components

---

*DFS and BFS are fundamental algorithms that every programmer should master. They form the foundation for more advanced graph algorithms and problem-solving techniques.*
