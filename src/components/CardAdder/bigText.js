let bigText = {
  "schema" : {

    inlines: {
      emoji: {
        isVoid: true,
      },
    },

    document: {
      nodes: [

        { match: { type: 'heading-one' }, min: 1 },
      ],
      normalize: (editor, { code, node, child, index }) => {
        switch (code) {
          case 'child_type_invalid': {
            return editor.setNodeByKey(child.key, 'heading-one')
          }

        }
      },
    },
  },
  "initial" : {
    "object": "value",
    "document": {
      "object": "document",
      "data": {},
      "nodes": [
        {
          "object": "block",
          "type": "heading-one",
          "data": {},
          "nodes": [
            {
              "object": "text",
              "text": "add big text",
              "marks": []
            }
          ]
        }
      ]
    }
  }
}

export default bigText;

