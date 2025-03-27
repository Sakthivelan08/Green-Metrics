import React, { Component } from 'react';
import { Grid, Typography, Paper, Button, List, ListItem, ListItemText } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Icon } from '@fluentui/react';

const styles = {
  container: {
    padding: '20px',
    margin: '110px 0px 0px 0px',
  },
  sidebar: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    margin: '-18px 0px 0px 0px',
    width: '180px',
  },
  main: {
    padding: '10px',
    margin: '0px 20px 0px -50px',
  },
  attributes: {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    margin: '-56px 0px 0px 10px',
    width: '180px',
  },
  list: {
    marginTop: '20px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '-12px 0px 0px 0px',
  },
  button: {
    display: 'flex',
    margin: '20px 10px 20px 13px',
  },
  conflict: {
    color: 'red',
    height: '70px',
    borderRadius: '8px',
  },
  attConflict: {
    display: 'flex',
    margin: '-13px',
    justifyContent: 'center',
    color: 'red',
  },
};

interface Template {
  name: string;
  attributes: number;
}

interface Category {
  category: string;
  templates: Template[];
}

interface AppProps {
  classes: {
    container: string;
    sidebar: string;
    main: string;
    attributes: string;
    list: string;
    listItem: string;
    button: string;
    conflict: string;
    attConflict: string;
  };
}

interface AppState {
  templateData: Category[];
  attributeConflicts: string[];
}

class TemplateData extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      templateData: [
        {
          category: 'Apparel and Fashion',
          templates: [
            { name: 'Accessories', attributes: 19 },
            { name: 'High heels', attributes: 12 },
            { name: 'Sneakers', attributes: 12 },
            { name: 'Tops and T-shirts', attributes: 23 },
          ],
        },
        {
          category: 'Automotive',
          templates: [
            { name: 'Tires', attributes: 19 },
            { name: 'Oils and Fluids', attributes: 19 },
          ],
        },
        {
          category: 'Batteries',
          templates: [{ name: 'Batteries', attributes: 19 }],
        },
      ],
      attributeConflicts: ['Main Identifier (Identifier)', 'Color (Simple select)'],
    };
  }

  render() {
    const { classes } = this.props;
    const { templateData, attributeConflicts } = this.state;

    return (
      <Grid container className={classes.container} spacing={3}>
        <Grid item xs={3}>
          <Paper className={classes.sidebar} style={{ background: '#EAEEFE' }}>
            <Typography
              variant="h6"
              style={{
                display: 'flex',
                color: '#4F60A3',
                fontWeight: 'bold',
                justifyContent: 'center',
              }}
            >
              Industries
            </Typography>
            <hr style={{ color: '#4F60A3' }}></hr>
            <List>
              {templateData.map((category, index) => (
                <ListItem button >
                  <ListItemText
                    primary={
                      <span style={{ fontWeight: 'lighter', color: '#4F60A3' }}>
                        {`${index + 1}. ${category.category}`}
                      </span>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Typography
            variant="h6"
            style={{
              display: 'flex',
              fontWeight: 'bold',
              justifyContent: 'center',
              color: '#1B3085',
              margin: '-125px 35px 0px 0px',
              fontSize: 'x-large',
            }}
          >
            Select a template
          </Typography>
          <Typography
            variant="h6"
            style={{
              display: 'flex',
              justifyContent: 'center',
              color: 'black',
              margin: '-5px 0px 10px -45px',
              fontSize: '10px',
            }}
          >
            Choose a family template pre - defined to industry best practices
          </Typography>
          <Paper className={classes.main}>
            {templateData.map((category, index) => (
              <div key={index}>
                <Typography
                  variant="subtitle1"
                  style={{
                    fontSize: '13px',
                    fontWeight: 'bold',
                    margin: '-5px 0px -9px 10px',
                    padding: '20px 0px 0px 15px',
                  }}
                >
                  {category.category}
                </Typography>
                <hr style={{ color: '#4F60A3' }}></hr>
                <Grid container spacing={2}>
                  {category.templates.map((template, idx) => (
                    <Grid item xs={6} key={idx}>
                      <Paper
                        style={{ margin: '19px 0px 0px 10px', height: '58px', width: '200px' }}
                      >
                        <Typography
                          variant="body1"
                          style={{
                            position: 'relative',
                            left: '35%',
                            top: '10%',
                            fontSize: '15px',
                            color: '#1B3085',
                          }}
                        >
                          {template.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{
                            position: 'relative',
                            left: '35%',
                            bottom: '-6%',
                            fontSize: '11px',
                          }}
                        >
                          {template.attributes} Attributes
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </div>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.attributes} style={{ background: '#EAEEFE' }}>
            <Typography
              variant="h6"
              style={{
                display: 'flex',
                justifyContent: 'center',
                color: '#4F60A3',
                fontWeight: 'bold',
              }}
            >
              High-heels
            </Typography>
            <hr style={{ color: '#4F60A3' }}></hr>

            <Typography className={classes.conflict} style={{ background: '#EBE4F5' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon iconName="Warning12" style={{ margin: '16px 0px 16px 0px', padding: '8px' }} />
                <Typography > 3 attributes are incompatible with existing ones in your family. They will not be added.
                </Typography>
              </div>
            </Typography>
            <Typography
              variant="h6"
              style={{
                display: 'flex',
                fontWeight: 'bold',
                justifyContent: 'center',
                margin: '3px 0px 0px 0px',
              }}
            >
              12 Attributes
            </Typography>
            <List className={classes.list}>
              {attributeConflicts.map((conflict, index) => (
                <div key={index}>
                  <ListItem key={index} className={classes.listItem}>
                    <ListItemText primary={conflict} />
                  </ListItem>
                  <Typography className={classes.attConflict}>Attribute conflict</Typography>
                </div>
              ))}
            </List>
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              style={{ backgroundColor: '#389E0D', color: 'white' }}
            >
              Use this template
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(TemplateData);
