import React from 'react';
import {
  Button,
  Alignment,
  AnchorButton,
  Tree,
  Classes,
  Navbar,
  NavbarGroup,
  ButtonGroup,
  NavbarHeading,
  NavbarDivider,
  Intent,
  Icon,
  Card,
  Elevation,
  InputGroup,
  Divider,
  TextArea,
  Menu,
  MenuItem,
  MenuDivider,
  Tabs,
  Tab
} from "@blueprintjs/core";
import {
  Placement,
  PlacementOptions,
  Popover2,
  Popover2InteractionKind,
  PopperModifierOverrides,
  StrictModifierNames,
  ContextMenu2,
  Tooltip2
} from "@blueprintjs/popover2";

import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import './App.css';

function App() {
  let nodes = [
    {
      id: 0,
      label: (
        <div>
          libsome.a&nbsp;
          <span style={{ fontSize: "75%", color: "gray" }}>
            (zephyr/some/directory/that/is/pretty/long/to/tests/the/limits)
          </span>
        </div>
      ),
      secondaryLabel: (
        <div>
          89.6&nbsp;KB&nbsp;
          <span style={{ fontSize: "75%", color: "gray" }}>(89&nbsp;889)</span>
        </div>
      ),
      icon: (
        <Tooltip2
          content={
            <table>
              <tr>
                <td>File&nbsp;name:</td>
                <td>libsome.a</td>
              </tr>
              <tr>
                <td>Directory:</td>
                <td>
                  zephyr/some/directory/that/is/pretty/long/to/tests/the/limits
                </td>
              </tr>
              <tr>
                <td>FLASH&nbsp;size:</td>
                <td>
                  89.6&nbsp;KB&nbsp;
                  <span style={{ fontSize: "75%", color: "silver" }}>
                    (89&nbsp;889)
                  </span>
                </td>
              </tr>
              <tr>
                <td>RAM&nbsp;size:</td>
                <td>
                  9.7&nbsp;KB&nbsp;
                  <span style={{ fontSize: "75%", color: "silver" }}>
                    (9&nbsp;623)
                  </span>
                </td>
              </tr>
              <tr>
                <td>FLASH&nbsp;address:</td>
                <td>0x00000F20&nbsp;-&nbsp;0x000089A4</td>
              </tr>
              <tr>
                <td>RAM&nbsp;address:</td>
                <td>0x80000F20&nbsp;-&nbsp;0x800089A4</td>
              </tr>
            </table>
          }
        >
          <Icon className="bp4-tree-node-icon" icon="folder-close" />
        </Tooltip2>
      ),
      isExpanded: true,
      childNodes: [
        {
          id: 1,
          label: "main.c.obj",
          secondaryLabel: (
            <div>
              8.32&nbsp;KB&nbsp;
              <span style={{ fontSize: "75%", color: "gray" }}>
                (8&nbsp;389)
              </span>
            </div>
          ),
          //icon: "document",
          isExpanded: true,
          childNodes: [
            {
              id: 5,
              label: "main",
              secondaryLabel: (
                <div>
                  1.33&nbsp;KB&nbsp;
                  <span style={{ fontSize: "75%", color: "gray" }}>
                    (1&nbsp;839)
                  </span>
                </div>
              ),
              //icon: "small-square"
            },
            {
              id: 6,
              label: <span style={{ color: "red" }}>my_func_32</span>,
              secondaryLabel: (
                <div style={{ color: "red" }}>
                  1.33&nbsp;KB&nbsp;
                  <span style={{ fontSize: "75%", color: "#FF000080" }}>
                    (1&nbsp;839)
                  </span>
                </div>
              ),
              icon: (
                <Icon
                  className="bp4-tree-node-icon"
                  color="red"
                  icon="small-square"
                />
              )
            }
          ]
        },
        {
          id: 2,
          label: "other.c.obj",
          secondaryLabel: (
            <div>
              1.33&nbsp;KB&nbsp;
              <span style={{ fontSize: "75%", color: "gray" }}>
                (1&nbsp;839)
              </span>
            </div>
          ),
          //icon: "document"
        }
      ]
    }
  ];
  return (
    <div>
      <Navbar className={Classes.DARK}>
        <NavbarGroup align={Alignment.LEFT}>
          <Button text="FLASH" icon="database" />
          <Button text="RAM" icon="database" intent={Intent.PRIMARY} />
        </NavbarGroup>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarDivider />
          <Button text="Libraries" icon="folder-close" />
          <Button text="Files" icon="document" intent={Intent.PRIMARY} />
          <Button text="Symbols" icon="small-square" intent={Intent.PRIMARY} />
        </NavbarGroup>
        <NavbarGroup align={Alignment.RIGHT}>
          <Button icon="filter" />
          <Button icon="properties" intent={Intent.PRIMARY} />
          <Button icon="control" intent={Intent.PRIMARY} />
        </NavbarGroup>
      </Navbar>
      <div
        style={{
          display: "flex"
        }}
      >
        <div style={{ flexGrow: 1, flexShrink: 1, minWidth: "100px" }}>
          <Navbar>
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>Content</NavbarHeading>
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <Button
                text="Size"
                icon="sort-numerical-desc"
                intent={Intent.PRIMARY}
              />
              <Button text="Name" icon="sort-alphabetical" />
              <Button text="Offset" icon="sort" />
              <NavbarDivider />
              <Button icon="collapse-all" />
            </NavbarGroup>
          </Navbar>
          <Tree contents={nodes} />
        </div>
        <div
          style={{
            flexGrow: 0,
            flexShrink: 0,
            width: "450px"
          }}
        >
          <Navbar>
            <NavbarGroup align={Alignment.LEFT}>
              <NavbarHeading>Filters</NavbarHeading>
            </NavbarGroup>
            <NavbarGroup align={Alignment.RIGHT}>
              <Popover2
                content={
                  <Menu>
                    <MenuItem icon="desktop" text="To local file" />
                    <MenuItem icon="add" text="Save as new preset" />
                    <MenuItem icon="blank" text="My preset" />
                    <MenuItem icon="blank" text="Second preset" />
                  </Menu>
                }
              >
                <Button text="Save" icon="export" />
              </Popover2>
              <Popover2
                content={
                  <Menu>
                    <MenuItem icon="desktop" text="From local file" />
                    <MenuItem icon="blank" text="My preset" />
                    <MenuItem icon="blank" text="Second preset" />
                  </Menu>
                }
              >
                <Button text="Load" icon="import" />
              </Popover2>
              <NavbarDivider />
              <Popover2
                content={
                  <Menu>
                    <MenuItem icon="small-square" text="Symbol" />
                    <MenuItem icon="document" text="File" />
                    <MenuItem icon="folder-close" text="Library" />
                    <MenuItem icon="not-equal-to" text="Expression" />
                    <MenuItem icon="code-block" text="JavaScript" />
                    <MenuDivider />
                    <MenuItem icon="import" text="From preset">
                      <MenuItem text="My preset">
                        <MenuItem icon="properties" text="All" />
                        <MenuItem
                          icon="small-square"
                          text={'Symbol starts with "my_"'}
                        />
                        <MenuItem
                          icon="small-square"
                          text={'Symbol contains "test"'}
                        />
                      </MenuItem>
                      <MenuItem text="Second preset" />
                    </MenuItem>
                  </Menu>
                }
              >
                <Button text="Add" icon="add" />
              </Popover2>
            </NavbarGroup>
          </Navbar>
          <div style={{ margin: 7 }}>
            <InputGroup
              leftElement={
                <ButtonGroup fill={true}>
                  <Button icon="drag-handle-vertical" minimal={true} />
                  <Button icon="tick" minimal={true} />
                  <Popover2
                    content={
                      <Menu>
                        <MenuItem icon="tick" text="Symbol" />
                        <MenuItem icon="blank" text="File" />
                        <MenuItem icon="blank" text="Library" />
                        <MenuItem icon="blank" text="Expression" />
                        <MenuItem icon="blank" text="JavaScript" />
                      </Menu>
                    }
                  >
                    <Button text="Symbol" minimal={true} />
                  </Popover2>
                  <Popover2
                    content={
                      <Menu>
                        <MenuItem icon="blank" text="equals" />
                        <MenuItem icon="blank" text="contains" />
                        <MenuItem icon="tick" text="starts with" />
                        <MenuItem icon="blank" text="ends with" />
                        <MenuItem icon="blank" text="matches regex" />
                      </Menu>
                    }
                  >
                    <Button text="starts with" minimal={true} />
                  </Popover2>
                </ButtonGroup>
              }
              value="my_"
              rightElement={
                <Popover2
                  content={
                    <Menu>
                      <MenuItem icon="eye-open" text="Show matching" />
                      <MenuItem icon="eye-off" text="Hide matching" />
                      <MenuItem icon="color-fill" text="Colorise matching">
                        <MenuItem
                          icon={<Icon icon="stop" color="Red" />}
                          text="Red"
                        />
                        <MenuItem
                          icon={<Icon icon="stop" color="Green" />}
                          text="Green"
                        />
                        <MenuItem
                          icon={<Icon icon="stop" color="Blue" />}
                          text="Blue"
                        />
                        <MenuItem
                          icon={<Icon icon="stop" color="Orange" />}
                          text="Orange"
                        />
                        <MenuItem
                          icon={<Icon icon="stop" color="BlueViolet" />}
                          text="Violet"
                        />
                        <MenuItem
                          icon={<Icon icon="stop" color="DarkCyan" />}
                          text="Cyan"
                        />
                      </MenuItem>
                      <MenuItem icon="color-fill" text="Colorise non-matching">
                        <MenuItem icon="stop" text="Green" />
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        intent={Intent.DANGER}
                        icon="trash"
                        text="Remove this filter"
                      />
                    </Menu>
                  }
                >
                  <Button icon="eye-off" minimal={true} />
                </Popover2>
              }
            />
          </div>
          <div style={{ margin: 7 }}>
            <InputGroup
              disabled
              leftElement={
                <ButtonGroup fill={true}>
                  <Button icon="drag-handle-vertical" minimal={true} />
                  <Button icon="disable" minimal={true} />
                  <Button text="File" minimal={true} />
                  <Button text="matches regex" minimal={true} />
                </ButtonGroup>
              }
              value=".*\.cpp\.o$"
              rightElement={
                <Button
                  icon={<Icon color="red" icon="high-priority" />}
                  minimal={true}
                  rightIcon={<Icon color="red" icon="color-fill" />}
                />
              }
            />
          </div>
          <div style={{ margin: 7 }}>
            <InputGroup
              leftElement={
                <ButtonGroup fill={true}>
                  <Button icon="drag-handle-vertical" minimal={true} />
                  <Button icon="tick" minimal={true} />
                  <Button text="Expression" minimal={true} />
                  <Popover2
                    fill={true}
                    content={
                      <div style={{ padding: 20 }}>
                        <TextArea
                          style={{ width: 500, height: 150 }}
                          value={
                            "//This is the comment\n\nThis is the\ntest\nand the thrid\nline."
                          }
                        />
                        <br />
                        <Tabs id="TabsExample" selectedTabId="operators">
                          <Tab
                            id="error"
                            title="Errors (3)"
                            style={{ color: "red" }}
                          />
                          <Tab title="Syntax" />
                          <Tab
                            id="operators"
                            title="Operators"
                            panel={
                              <div
                                style={{
                                  height: 200,
                                  width: 500,
                                  overflow: "auto",
                                  borderColor: "silver",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  padding: 5
                                }}
                              >
                                You can use following operators in the
                                expression:
                                <ul>
                                  <li>! - negate the value, aliases: not</li>
                                  <li>
                                    = - checks if strings are equal (case
                                    insensitive), aliases: ==, equal, equals
                                  </li>
                                  <li>
                                    != - checks if strings are not equal (case
                                    insensitive), aliases: not ==, not equal,
                                    not equals
                                  </li>
                                  <li>
                                    ^= - checks if string on the left starts
                                    with string on the left (case insensitive),
                                    aliases: start, starts, start with, starts
                                    with
                                  </li>
                                  <li>
                                    $= - checks if string on the left ends with
                                    string on the left (case insensitive),
                                    aliases: end, ends, end with, ends with
                                  </li>
                                  <li>~=</li>
                                  <li>&&</li>
                                  <li>||</li>
                                  <li>^^</li>
                                  <li>matches</li>
                                  <li>if then else</li>
                                  <li>( )</li>
                                </ul>
                              </div>
                            }
                          />
                          <Tab title="Fields" />
                          <Tab id="ex" title="Examples" />
                        </Tabs>
                      </div>
                    }
                  >
                    <Button icon="edit" minimal={true} rightIcon="caret-down" />
                  </Popover2>
                </ButtonGroup>
              }
              style={{ color: "gray" }}
              value="This is the comment"
              rightElement={
                <Button
                  icon={<Icon color="blue" icon="color-fill" />}
                  minimal={true}
                />
              }
            />
          </div>
          <div style={{ margin: 7 }}>
            <InputGroup
              leftElement={
                <ButtonGroup fill={true}>
                  <Button icon="drag-handle-vertical" minimal={true} />
                  <Button icon="tick" minimal={true} />

                  <Button text="JavaScript" minimal={true} />
                  <Popover2
                    fill={true}
                    content={
                      <div style={{ padding: 20 }}>
                        <TextArea
                          style={{ width: 500, height: 300 }}
                          value={
                            "//This is the comment\n\nThis is the\ntest\nand the thrid\nline."
                          }
                        />
                        <br />
                        <Tabs id="TabsExample" selectedTabId="operators">
                          <Tab id="error" title="Errors (0)" />
                          <Tab
                            id="operators"
                            title="Help"
                            panel={
                              <div
                                style={{
                                  margin: 0,
                                  height: 200,
                                  width: 500,
                                  overflow: "auto",
                                  borderColor: "silver",
                                  borderWidth: "1px",
                                  borderStyle: "solid",
                                  padding: 5
                                }}
                              >
                                The source code is placed inside a JavaScript
                                function. It is called for each symbol. It has
                                following string parameters:
                                <ul>
                                  <li>symbol</li>
                                  <li>file</li>
                                  <li>library</li>
                                  <li>memory</li>
                                </ul>
                                The return value can be:
                                <ul>
                                  <li>true - to accept a symbol</li>
                                  <li>false - to remove a symbol</li>
                                  <li>
                                    string - to accept and colorize the symbol.
                                    The string contains HTML color hex value,
                                    e.g. "#FF0000".
                                  </li>
                                </ul>
                                If the first line contains comment, it will be
                                shown as a filter name.
                              </div>
                            }
                          />
                          <Tab id="ex" title="Examples" />
                        </Tabs>
                      </div>
                    }
                  >
                    <Button icon="edit" minimal={true} rightIcon="caret-down" />
                  </Popover2>
                </ButtonGroup>
              }
              style={{ color: "gray" }}
              value="Comment from JS"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
