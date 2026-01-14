describe('Basic Editor', () => {
  const getEditable = () => cy.get('[data-testid="editor-textarea"] [contenteditable="true"]')

  beforeEach(() => {
    cy.visit('/examples/default-mode.html')
    cy.get('[data-testid="btn-create"]').click()
  })

  it('create editor', () => {
    cy.get('[data-testid="editor-toolbar"]').should('have.attr', 'data-w-e-toolbar', 'true')
    cy.get('[data-testid="editor-textarea"]').should('have.attr', 'data-w-e-textarea', 'true')
    cy.get('#w-e-textarea-1').contains('一行标题')
  })

  it('updates html when typing', () => {
    getEditable().click().type('{selectall}{backspace}e2e-text')
    cy.get('[data-testid="editor-html"]').should('contain', 'e2e-text')
  })

  it('applies bold and italic formatting', () => {
    getEditable().click().type('{selectall}{backspace}format text')
    getEditable().type('{selectall}')

    cy.get('[data-menu-key="bold"]').click()
    cy.get('[data-menu-key="italic"]').click()

    cy.get('[data-testid="editor-html"]').should('contain', '<strong>')
    cy.get('[data-testid="editor-html"]').should('contain', '<em>')
  })

  it('creates a bulleted list item', () => {
    getEditable().click().type('{selectall}{backspace}list item')
    cy.get('[data-menu-key="bulletedList"]').click()

    cy.get('[data-testid="editor-html"]').should('contain', '<ul>')
    cy.get('[data-testid="editor-html"]').should('contain', '<li>list item</li>')
  })

  it('undoes and redoes changes', () => {
    getEditable().click().type('{selectall}{backspace}undo text')
    cy.get('[data-testid="editor-html"]').should('contain', 'undo text')

    cy.get('[data-menu-key="undo"]').click()
    cy.get('[data-testid="editor-html"]').should('not.contain', 'undo text')

    cy.get('[data-menu-key="redo"]').click()
    cy.get('[data-testid="editor-html"]').should('contain', 'undo text')
  })

  it('inserts a table', () => {
    getEditable().click()
    cy.get('[data-menu-key="insertTable"]').click()
    cy.get('.w-e-panel-content-table td').first().click()

    cy.get('[data-testid="editor-html"]').should('contain', '<table')
  })

  it('uploads an image as base64', () => {
    getEditable().click().type('{selectall}{backspace}')

    cy.get('[data-menu-key="uploadImage"]').click({ force: true })
    cy.get('input[type="file"]').last().selectFile({
      contents: 'fake-image',
      fileName: 'e2e.png',
      mimeType: 'image/png',
    }, { force: true })

    cy.get('[data-testid="editor-html"]').should('contain', 'data:image')
  })

  it('creates a code block', () => {
    getEditable().click().type('{selectall}{backspace}code line')
    getEditable().type('{selectall}')

    cy.get('[data-menu-key="codeBlock"]').click()

    cy.get('[data-testid="editor-html"]').should('contain', '<pre>')
    cy.get('[data-testid="editor-html"]').should('contain', '<code>')
  })

  it('toggles readOnly via button', () => {
    cy.get('#w-e-textarea-1').should('have.attr', 'contenteditable', 'true')
    cy.get('[data-testid="btn-toggle-enable"]').trigger('mousedown')
    cy.get('#w-e-textarea-1').should('have.attr', 'contenteditable', 'false')

    cy.get('[data-testid="btn-toggle-enable"]').trigger('mousedown')
    cy.get('#w-e-textarea-1').should('have.attr', 'contenteditable', 'true')
  })

  it('toggles full screen mode', () => {
    cy.get('[data-menu-key="fullScreen"]').click()
    cy.get('[data-testid="editor-textarea"]')
      .parent()
      .should('have.class', 'w-e-full-screen-container')

    cy.get('[data-menu-key="fullScreen"]').click()
    cy.wait(250)
    cy.get('[data-testid="editor-textarea"]')
      .parent()
      .should('not.have.class', 'w-e-full-screen-container')
  })
})
