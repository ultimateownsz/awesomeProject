package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"
	"time"
)

func capitalize(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func promptInput(reader *bufio.Reader, prompt string) (string, error) {
	fmt.Print(capitalize(prompt))
	input, err := reader.ReadString('\n')
	if err != nil {
		return "", fmt.Errorf("failed to read input: %w", err)
	}
	return strings.TrimSpace(input), nil
}

func main() {
	reader := bufio.NewReader(os.Stdin)

	// Category selection
	categories := []string{"Prototype", "Game Mechanics"}
	fmt.Println(capitalize("Available categories:"))
	for i, category := range categories {
		fmt.Printf("%d: %s\n", i+1, category)
	}
	fmt.Printf(capitalize("Enter category number (1-%d): "), len(categories))
	categoryInput, err := promptInput(reader, "")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	var categoryIndex int
	n, err := fmt.Sscanf(categoryInput, "%d", &categoryIndex)
	if err != nil || n != 1 || categoryIndex < 1 || categoryIndex > len(categories) {
		fmt.Println("Invalid category selection. Please enter a valid number.")
		return
	}
	category := categories[categoryIndex-1]

	// Mechanic input
	fmt.Println(capitalize("Describe the mechanic:"))
	mechanic, err := promptInput(reader, "")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	// Tag selection
	tagsList := []string{"2D", "3D", "FPS", "RPG", "Strategy", "Simulation", "Puzzle", "Adventure", "Horror", "Multiplayer"}
	fmt.Println(capitalize("Available tags:"))
	for i, tag := range tagsList {
		fmt.Printf("%d: %s\n", i+1, tag)
	}
	fmt.Print(capitalize("Enter tag numbers (comma-separated): "))
	tagsInput, err := promptInput(reader, "")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	tagNums := strings.Split(tagsInput, ",")
	var tags []string
	for _, num := range tagNums {
		var n int
		_, err := fmt.Sscanf(strings.TrimSpace(num), "%d", &n)
		if err != nil || n < 1 || n > len(tagsList) {
			fmt.Printf("Skipping invalid tag number: %s\n", num)
			continue
		}
		tags = append(tags, tagsList[n-1])
	}

	// Post creation
	title, err := promptInput(reader, "Enter post title: ")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	whyAwesome, err := promptInput(reader, "Explain why this is awesome: ")
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	date := time.Now().Format("2006-01-02T15:04:05-07:00")
	filename := "content/posts/" + strings.ReplaceAll(strings.ToLower(title), " ", "-") + ".md"

	content := fmt.Sprintf(`---
title: "%s"
date: "%s"
draft: true
category: [%s]
tags: [%s]
why_awesome: "%s"
mechanic: "%s"
author:
  name: ""
  email: ""
---
# %s

## Why is this awesome?
%s

## Mechanic
%s
`, title, date, category, strings.Join(tags, ", "), whyAwesome, mechanic, title, whyAwesome, mechanic)

	err = os.WriteFile(filename, []byte(content), 0644)
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}

	fmt.Println("Post created:", filename)
}
