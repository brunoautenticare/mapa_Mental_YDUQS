/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from "@testing-library/react"
import { MindMap } from "./mind-map"
import "@testing-library/jest-dom"

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock data
const sampleData = {
  id: "root",
  name: "Main Topic",
  children: [
    {
      id: "1",
      name: "Topic 1",
      children: [
        { id: "1-1", name: "Subtopic 1.1" },
        { id: "1-2", name: "Subtopic 1.2" },
      ],
    },
    {
      id: "2",
      name: "Topic 2",
      children: [
        { id: "2-1", name: "Subtopic 2.1" },
        { id: "2-2", name: "Subtopic 2.2" },
      ],
    },
  ],
}

// Mock d3 functionality
jest.mock("d3", () => {
  const originalD3 = jest.requireActual("d3")
  return {
    ...originalD3,
    select: jest.fn().mockReturnValue({
      selectAll: jest.fn().mockReturnValue({
        remove: jest.fn(),
        data: jest.fn().mockReturnThis(),
        enter: jest.fn().mockReturnThis(),
        append: jest.fn().mockReturnThis(),
        attr: jest.fn().mockReturnThis(),
        style: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        empty: jest.fn().mockReturnValue(false),
        node: jest.fn().mockReturnValue({
          getBoundingClientRect: jest.fn().mockReturnValue({
            width: 100,
            height: 50,
          }),
        }),
        each: jest.fn((callback) => {
          callback()
        }),
      }),
      append: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      style: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      empty: jest.fn().mockReturnValue(false),
    }),
    hierarchy: jest.fn().mockReturnValue({
      descendants: jest.fn().mockReturnValue([]),
      links: jest.fn().mockReturnValue([]),
    }),
    tree: jest.fn().mockReturnValue(jest.fn()),
    cluster: jest.fn().mockReturnValue(jest.fn()),
    linkHorizontal: jest.fn().mockReturnValue(jest.fn()),
    linkVertical: jest.fn().mockReturnValue(jest.fn()),
    linkRadial: jest.fn().mockReturnValue(jest.fn()),
  }
})

describe("MindMap Component", () => {
  // Test rendering
  test("renders the component correctly", () => {
    render(<MindMap data={sampleData} diagramType="mind-map" colorPalette="default" layoutStyle="standard" />)

    expect(screen.getByTestId("mind-map-component")).toBeInTheDocument()
    expect(screen.getByTestId("diagram-container")).toBeInTheDocument()
    expect(screen.getByTestId("diagram-svg")).toBeInTheDocument()
  })

  // Test controls
  test("renders control buttons correctly", () => {
    render(<MindMap data={sampleData} diagramType="mind-map" colorPalette="default" layoutStyle="standard" />)

    expect(screen.getByTestId("zoom-in-button")).toBeInTheDocument()
    expect(screen.getByTestId("zoom-out-button")).toBeInTheDocument()
    expect(screen.getByTestId("reset-button")).toBeInTheDocument()
    expect(screen.getByTestId("fullscreen-button")).toBeInTheDocument()
    expect(screen.getByTestId("export-button")).toBeInTheDocument()
  })

  // Test zoom functionality
  test("zoom controls change zoom state", () => {
    render(<MindMap data={sampleData} diagramType="mind-map" colorPalette="default" layoutStyle="standard" />)

    const zoomInButton = screen.getByTestId("zoom-in-button")
    const zoomOutButton = screen.getByTestId("zoom-out-button")

    // Initial zoom should be 1
    const slider = screen.getByTestId("zoom-slider")
    expect(slider).toHaveAttribute("aria-valuenow", "1")

    // Click zoom in
    fireEvent.click(zoomInButton)
    // Zoom should increase
    expect(slider).toHaveAttribute("aria-valuenow", "1.1")

    // Click zoom out
    fireEvent.click(zoomOutButton)
    // Zoom should decrease back to 1
    expect(slider).toHaveAttribute("aria-valuenow", "1")
  })

  // Test container responsiveness
  test("container has correct responsive styles", () => {
    render(<MindMap data={sampleData} diagramType="mind-map" colorPalette="default" layoutStyle="standard" />)

    const container = screen.getByTestId("diagram-container")

    // Container should have width: 100%
    expect(container).toHaveClass("w-full")

    // Container should have fixed height
    expect(container).toHaveClass("h-[500px]")

    // SVG should have width and height of 100%
    const svg = screen.getByTestId("diagram-svg")
    expect(svg).toHaveAttribute("width", "100%")
    expect(svg).toHaveAttribute("height", "100%")
  })

  // Test mouse interactions
  test("mouse interactions change cursor style", () => {
    render(<MindMap data={sampleData} diagramType="mind-map" colorPalette="default" layoutStyle="standard" />)

    const container = screen.getByTestId("diagram-container")

    // Initial cursor should be grab
    expect(container).toHaveStyle("cursor: grab")

    // Mouse down should change cursor to grabbing
    fireEvent.mouseDown(container)
    expect(container).toHaveStyle("cursor: grabbing")

    // Mouse up should change cursor back to grab
    fireEvent.mouseUp(container)
    expect(container).toHaveStyle("cursor: grab")
  })
})
