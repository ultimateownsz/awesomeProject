---
title: "Graph Types and Properties"
date: 2026-01-05
draft: false
---

# Graph Types and Properties

Graphs come in many varieties, each with unique characteristics that make them suitable for different applications. Understanding these types is crucial for selecting the right approach to solve graph-related problems.

## Fundamental Graph Types

### 1. Undirected Graphs

In an **undirected graph**, edges have no direction. If there's an edge between vertex A and vertex B, you can traverse from A to B and from B to A.

**Characteristics**:
- Edges are bidirectional
- If (u, v) is an edge, then (v, u) is implicitly also an edge
- Represented by unordered pairs: {u, v}

**Examples**:
- Social networks (friendships are mutual)
- Road networks (most roads are bidirectional)
- Molecular structures

**Visual Representation**:
```
A ---- B
|      |
|      |
C ---- D
```

### 2. Directed Graphs (Digraphs)

In a **directed graph**, edges have a specific direction. An edge from vertex A to vertex B (A → B) allows traversal only from A to B, not from B to A.

**Characteristics**:
- Edges are unidirectional
- Represented by ordered pairs: (u, v)
- (u, v) ≠ (v, u)

**Examples**:
- Web page links (one page links to another)
- Task dependencies (task A must complete before task B)
- Twitter follows (following is not mutual)

**Visual Representation**:
```
A --→ B
↓     ↓
C ←-- D
```

### 3. Weighted Graphs

In a **weighted graph**, each edge has an associated numerical value (weight) representing cost, distance, capacity, or other metrics.

**Characteristics**:
- Each edge has a weight: w(u, v)
- Can be directed or undirected
- Weights can be positive, negative, or zero

**Examples**:
- Road networks with distances
- Network flow with capacities
- Cost optimization problems

**Visual Representation**:
```
A --5-- B
|       |
3       2
|       |
C --4-- D
```

### 4. Unweighted Graphs

In an **unweighted graph**, all edges are considered equal (or implicitly have weight 1).

**Characteristics**:
- No edge weights
- All edges have equal importance
- Simpler algorithms can be used

**Examples**:
- Simple friendship networks
- Binary relationships

## Special Graph Types

### 5. Complete Graphs

A **complete graph** is a graph where every pair of distinct vertices is connected by a unique edge.

**Notation**: K_n (complete graph with n vertices)

**Properties**:
- Number of edges: E = n(n-1)/2 for undirected graphs
- Every vertex has degree n-1
- No vertex is unreachable from any other vertex

**Applications**:
- Worst-case analysis
- Clique detection
- Tournament scheduling

### 6. Bipartite Graphs

A **bipartite graph** is a graph whose vertices can be divided into two disjoint sets such that every edge connects a vertex in one set to a vertex in the other set.

**Properties**:
- Vertices can be partitioned into two sets: U and V
- All edges connect vertices from U to V
- No edges within U or within V
- Contains no odd-length cycles

**Applications**:
- Job matching problems
- Recommendation systems
- Scheduling problems

**Visual Representation**:
```
Set U:  A   B   C
        |\ /|\ /|
        | X | X |
        |/ \|/ \|
Set V:  D   E   F
```

### 7. Trees

A **tree** is a connected acyclic undirected graph. Equivalently, it's a connected graph with n vertices and n-1 edges.

**Properties**:
- Exactly one path between any two vertices
- Adding any edge creates a cycle
- Removing any edge disconnects the graph
- If tree has n vertices, it has n-1 edges

**Special Trees**:
- **Binary Tree**: Each node has at most 2 children
- **Spanning Tree**: A subgraph that includes all vertices of the original graph
- **Minimum Spanning Tree (MST)**: A spanning tree with minimum total edge weight

**Applications**:
- File systems
- Organization hierarchies
- Decision processes

### 8. Directed Acyclic Graphs (DAGs)

A **DAG** is a directed graph with no directed cycles.

**Properties**:
- Has at least one topological ordering
- At least one vertex with in-degree 0 (source)
- At least one vertex with out-degree 0 (sink)

**Applications**:
- Task scheduling
- Dependency resolution
- Compiler optimization
- Version control systems

### 9. Cyclic Graphs

A **cyclic graph** contains at least one cycle.

**Properties**:
- Contains at least one path that starts and ends at the same vertex
- More complex to analyze than acyclic graphs

### 10. Multigraphs

A **multigraph** allows multiple edges between the same pair of vertices.

**Properties**:
- Can have parallel edges
- May have self-loops (edges from a vertex to itself)

**Applications**:
- Transportation networks with multiple routes
- Network with redundant connections

## Graph Properties

### Connectivity

**Connected Graph**: An undirected graph where there's a path between every pair of vertices.

**Strongly Connected**: A directed graph where there's a directed path from every vertex to every other vertex.

**Weakly Connected**: A directed graph that is connected when edge directions are ignored.

**Connected Components**: Maximal connected subgraphs.

### Density

**Sparse Graph**: A graph with relatively few edges (typically E = O(V)).

**Dense Graph**: A graph with many edges (typically E = O(V²)).

### Planarity

**Planar Graph**: A graph that can be drawn on a plane without edge crossings.

**Examples**: Trees, K₄ (complete graph with 4 vertices)

**Non-planar Examples**: K₅, K₃,₃

### Graph Diameter

The **diameter** of a graph is the longest shortest path between any two vertices.

### Graph Radius

The **radius** of a graph is the minimum eccentricity of any vertex, where eccentricity is the maximum distance from that vertex to any other vertex.

## Choosing the Right Graph Type

When modeling a problem:

1. **Determine directionality**: Are relationships mutual or one-way?
2. **Consider weights**: Do connections have associated costs or values?
3. **Check for special properties**: Is the graph tree-like? Does it have cycles?
4. **Assess density**: Will the graph be sparse or dense?
5. **Identify constraints**: Are there special structural requirements?

## Next Steps

- Learn about [Graph Traversal Algorithms]({{< ref "traversal-algorithms" >}}) to explore different graph types
- Study [Shortest Path Algorithms]({{< ref "shortest-path" >}}) for weighted graphs
- Explore [Applications]({{< ref "applications" >}}) to see these graph types in action

---

*Understanding graph types and properties is essential for selecting the right algorithms and data structures for your problem domain.*
