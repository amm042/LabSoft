import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Panel, ButtonGroup, Button, Row, Col, Glyphicon } from 'react-bootstrap';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import BigCalendar from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
BigCalendar.momentLocalizer(moment); // or globalizeLocalizer

class ClassCalendar extends Component {

  constructor(props) {
    super(props);

    this.state = {
      course: null,
      courses: props.courses
    }

    this.onSelectEvent = this.onSelectEvent.bind(this);
    this.onSelectCourse = this.onSelectCourse.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      // course: nextProps.courses.list.find(course => course.name === nextProps.match.match.params.course),
      courses: nextProps.courses
    });
  }

  onSelectEvent(event) {
    let path = "/homeworks/" + this.state.course.name;
    event.path.forEach(item => {
      path += '/' + item;
    });
    this.props.match.history.push(path);
  }

  getEventList() {
    const eventList = [];
    let index = 0, sem_date, ass_date, end_ass_date, prob_date, end_prob_date;
    if (this.state.course) {
      this.state.course.semesters.forEach((semester, sem_index) => {
        sem_date = new Date(semester.startDate.getTime());
        semester.assignments.forEach((assignment, ass_index) => {
          ass_date = new Date(sem_date.getTime());
          ass_date.setDate(sem_date.getDate() + 7 * ass_index);
          end_ass_date = new Date(ass_date.getTime());
          end_ass_date.setDate(end_ass_date.getDate() + 6);
          eventList.push({
            id: index++,
            path: [semester.name, assignment.name],
            title: `${assignment.name}`,
            allDay: true,
            start: ass_date,
            end: end_ass_date,
            color: "red"
          });
          assignment.problems.forEach((problem, prob_index) => {
            prob_date = new Date(ass_date.getTime());
            prob_date.setDate(ass_date.getDate() + problem.dayOffset);
            end_prob_date = new Date(prob_date.getTime());
            end_prob_date.setDate(end_prob_date.getDate());
            eventList.push({
              id: index++,
              path: [semester.name, assignment.name, problem.name],
              title: `${assignment.name} - ${problem.name}`,
              allDay: true,
              start: prob_date,
              end: end_prob_date,
              color: "blue"
            });
          });
        });
      });
    }
    return eventList;
  }

  getCustomToolbar(toolbar) {
    const goToDayView = () => {
      toolbar.onViewChange('day');
    }
    const goToWeekView = () => {
      toolbar.onViewChange('week');
    }
    const goToMonthView = () => {
      toolbar.onViewChange('month');
    }

    const goToBack = () => {
      if (toolbar.view === 'month') {
        toolbar.date.setMonth(toolbar.date.getMonth() - 1);
        toolbar.onNavigate('prev');
      } else if (toolbar.view === 'week') {
        toolbar.date.setDate(toolbar.date.getDate() - 7);
        toolbar.onNavigate('prev');
      } else if (toolbar.view === 'day') {
        toolbar.date.setDate(toolbar.date.getDate() - 1);
        toolbar.onNavigate('prev');
      }
    };

    const goToNext = () => {
      if (toolbar.view === 'month') {
        toolbar.date.setMonth(toolbar.date.getMonth() + 1);
        toolbar.onNavigate('next');
      } else if (toolbar.view === 'week') {
        toolbar.date.setDate(toolbar.date.getDate() + 7);
        toolbar.onNavigate('next');
      } else if (toolbar.view === 'day') {
        toolbar.date.setDate(toolbar.date.getDate() + 1);
        toolbar.onNavigate('next');
      }
    };

    const goToCurrent = () => {
      const now = new Date();
      toolbar.date.setDate(now.getDate());
      toolbar.date.setMonth(now.getMonth());
      toolbar.date.setYear(now.getFullYear());
      toolbar.onNavigate('current');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <span><b>{date.format('MMMM')}</b><span> {date.format('YYYY')}</span></span>
      );
    };

    return (
      <Row className="show-grid">
        <Col sm={4} className="left">
          <ButtonGroup>
            <Button onClick={goToBack}>
              <Glyphicon glyph='chevron-left' />
            </Button>
            <Button onClick={goToNext}>
              <Glyphicon glyph='chevron-right' />
            </Button>
            <Button onClick={goToCurrent}>
              Today
            </Button>
          </ButtonGroup>
        </Col>
        <Col sm={4}>
          <h4>{label()}</h4>
        </Col>
        <Col sm={4} className="right">
          <ButtonGroup>
            <Button onClick={goToDayView}>Day</Button>
            <Button onClick={goToWeekView}>Week</Button>
            <Button onClick={goToMonthView}>Month</Button>
          </ButtonGroup>
        </Col>
      </Row>
    );
  }

  onSelectCourse(selectedOption) {
    if (selectedOption)
      this.setState({ course: this.props.courses.list.find(course => course.name === selectedOption.value) })
  }

  getCourseDropdown() {
    let courses = [{ value: null, label: "Select the Course" }];
    this.state.courses.list.forEach(course => { courses.push({ value: course.name, label: course.full_name }) });
    return (
      <Select 
        name="course-dropdown"
        placeholder="Select the Course"
        value={ (this.state.course !== null && this.state.course !== undefined) ? this.state.course.name : null }
        onChange={ this.onSelectCourse }
        options={ courses }
        />
    );
  }

  render() {
    return (
      <div className="ClassCalendar">
        <Panel>
          <Panel.Heading className="center" componentClass="h3">
            <Row className="show-grid">
              <Col sm={3} style={{ textAlign:'left' }}>
                
              </Col>
              <Col sm={6}>
                { this.getCourseDropdown() }
              </Col>
              <Col sm={3} className="right">
                { /*this.getEditButton()*/ }
              </Col>
            </Row>
          </Panel.Heading>
          <Panel.Body>
            <BigCalendar
              events={this.getEventList()}
              defaultDate={new Date()}
              startAccessor='start'
              endAccessor='end'
              selectable
              onSelectEvent={this.onSelectEvent}
              eventPropGetter={event => ({className: 'category-' + event.color})}
              components={{
                toolbar: this.getCustomToolbar
              }}
            />
          </Panel.Body>
        </Panel>
      </div>
    );
  }

}

const mapStateToProps = state => {
  const assignments = { ...state.assignments, list: state.assignments.list.map(assignment => { return { ...assignment, problems: [] } }) };
  state.assignments.list.forEach((assignment, index) => {
    assignment.problems.forEach(prob_id => {
      let prob = state.problems.list.find(prob => prob._id === prob_id);
      if (prob) {
        assignments.list[index].problems.push(prob);
      }
    });
  });
  const semesters = { ...state.semesters, list: state.semesters.list.map(semester => { return { ...semester, assignments: [] } }) };
  state.semesters.list.forEach((semester, index) => {
    if (typeof semester.startDate === 'string') {
      semesters.list[index].startDate = new Date(Date.parse(semester.startDate));
    }
    semester.assignments.forEach(ass_id => {
      let ass = assignments.list.find(ass => ass._id === ass_id);
      if (ass) {
        semesters.list[index].assignments.push(ass);
      }
    });
  });
  const courses = { ...state.courses, list: state.courses.list.map(course => { return { ...course, semesters: [] } }) };
  state.courses.list.forEach((course, index) => {
    courses.list[index].name = course.name;
    courses.list[index].full_name = course.full_name;
    courses.list[index].description = course.description;
    course.semesters.forEach(sem_id => {
      let sem = semesters.list.find(sem => sem._id === sem_id);
      if (sem) {
        courses.list[index].semesters.push(sem);
      }
    })
  });

  return {
    courses: courses
  }
}

export default ClassCalendar = connect(mapStateToProps, null)(ClassCalendar);
