import ReactDOM from 'react-dom'

export function mount(element: any, container: Element) {
  ReactDOM.render(element, container)
  return {
    render: (next: any) => ReactDOM.render(next, container),
    unmount: () => ReactDOM.unmountComponentAtNode(container),
  }
}
