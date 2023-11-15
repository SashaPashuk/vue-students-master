<template>
  <div id="students">
    <ul>
      <li v-for="(group, index) in groups" :key="index"><span class="group_button" @dblclick="editGroup" @click="changeGroup" :id="group.id"><input type="text" :id="group.id" :value="group.acronym"/></span></li>
      <li><span class="group_button"><input onkeydown="this.style.width = ((this.value.length + 1) * 8) + 'px';" style="border: none; text-align: center; width: 80px; background-color: inherit; cursor: pointer" @blur="addGroup" placeholder="Додати групу"/></span></li>
    </ul>
    <select v-if="subjects.length > 0" @blur="changeSubject" :id="subject_id" class="group_button">
        <option v-for="(subject, index) in subjects" :key="index" :value="subject.subject_id" :id="subject.id">{{ subject.name }}</option>
    </select>
    
    <h2 v-else>Додайте предмети до цієї групи.</h2>
    <span class="group_button" style="display: inline-flex"><input onkeydown="this.style.width = ((this.value.length + 1) * 8) + 'px';"  style="border: none; text-align: center; width: 100px; background-color: inherit; cursor: pointer" @blur="addSubject" type="text" placeholder="Додати предмет"/></span>
    <!-- <ul v-if="subjects">
      <li v-for="(subject, index) in subjects" :key="index"><span class="group_button" @click="changeSubject" :id="subject.subject_id">{{subject.name}}</span></li>
    </ul> -->
    <!-- <button @click="getStudents"></button> -->
    <table class="table" id="students_table" style="margin-bottom: 2vh;" v-if="students">
      <thead>
      <tr>
        <th>№</th>
        <th>ПІБ студента</th>
        <th v-for="(date, index) in dates" :key="index">
        <!-- <button @click="addModul" title="Модуль">&#10003;</button> -->
        <div class="date_block">
          <div :id="date.id"> {{ date.mark_date }}</div>
          <div>
            <hr>
            <input type="text" onkeydown="this.style.width = ((this.value.length + 1) * 8) + 'px';" class="date_type_input" name="typeDate" :id="date.id" :value="date.mark_type" @change="updateMarkType">
          </div>
        </div>
        <!-- <br>
        {{ date.mark_type }} -->
        <!-- <input type="text" id="typeDate" value=""> -->

        </th>
        <th>
          <input class="date_input" type="date" id="date" @blur="addColumn">
          <!-- @blur="addColumn" -->
          <!-- onfocus="(this.type='date')" onblur="(this.type='text')" -->
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(student, index) in students" :key="index" :id="index">
        <td>{{index+1}}</td>
        <td>{{student.last_name}} {{student.first_name}}</td>
        <td v-for="(mark, index) in student.marks" :key="index">
          <input v-if="mark.mark > 0" :value="mark.mark" type="text" :id="mark.id" @blur="updateMark"/>
          <input v-else type="text" :id="mark.id" @blur="updateMark"/>
        </td>
      </tr>
      </tbody>
    </table>
    
    <h2 v-else>В цій групі немає студентів.</h2>
    <span class="group_button"><input style="border: none; text-align: center; width: 110px; background-color: inherit; cursor: pointer" onkeydown="this.style.width = ((this.value.length + 1) * 8) + 'px';" @blur="addStudent" placeholder="Додати студента"/></span>
    <div>
      <!-- <button @click="importExcel">Clicl</button> -->
      <button class="excel_button" title="Вигрузити Excel" @click="exportExcel"><img src="../../public/excel-export.png" style="width: 30px; height: 30px; cursor: pointer;"/></button>
      <input class="excel_button" type="file" title="Загрузити Excel" @input="loadData" @blur="importExcel"/><!-- <img src="../../public/excel-import.png" style="width: 30px; height: 30px; cursor: pointer;"/> -->
  </div>
  </div>
</template>

<script>
// import groups, from "@/libs/data";
import axios from 'axios'
import Vue from 'vue';
import XLSX from 'xlsx';


export default {
  name: 'Table',
  props: ['msg'],
  data() {
    return{
      students: [],
      groups: [{'id':1, 'acronym':'ІС'}],
      group_id_counter: 2,
      subject_id_counter: 3,
      subject_id_counter: 3,
      student_id_counter: 3,
      mark_id_counter: 3,
      date_id_counter: 3, 
      group_id: 0,
      subject_id: 0,
      dates: [],
      date: '',
      excelData: [],
      subjects: [],
      all_dates: [{id: 1, mark_date: '2021-11-12', mark_type: '', group_id: 1, subject_id: 1}, {id: 2, mark_date: '2021-11-15', mark_type: '', group_id: 1, subject_id: 2}],
      all_marks: [{id: 1, mark: 3, user_id: 1, subject_id: 1, group_id: 1}, {id: 2, mark: 5, user_id: 2, subject_id: 1, group_id: 1}],
      all_subjects: [{name: 'Іноземна', id: 1, group_id: 1}, {name: 'Алгебра', id: 2, group_id: 2}],
      all_students: [{id: 1, first_name: 'Олексій', last_name: 'Гаврилов', group_id: 1, marks: []}, {id: 2, first_name: 'Сергій', last_name: 'Носов', group_id: 1, marks: []}]
    }
  },
  // mounted() {
  //     let excel = document.createElement('script')
  //     excel.setAttribute('src', 'https://cdn.jsdelivr.net/gh/linways/table-to-excel@v1.0.4/dist/tableToExcel.js')
  //     document.head.appendChild(excel)
  //   },
  methods: {
    addSubject(event){
      if(event.target.value != '') {
        this.all_subjects.push({name: event.target.value, id: this.subject_id_counter++, group_id: this.group_id});
        event.target.value = '';
        this.subjects = [];
        this.getSubjects(this.group_id);
        event.target.style.width = '80px';
      }
    },
    addGroup(event){
      if(event.target.value != '') this.groups.push({id: this.group_id_counter++, acronym: event.target.value});
      event.target.value = '';
      event.target.style.width = '80px';
    },
    addStudent(event){
      if(event.target.value != ''){
        let first_name = event.target.value.split(' ')[0];
        let last_name = event.target.value.split(' ')[1];
        if(this.dates.length != 0){
          let marks_length = this.dates.length;
          // if(this.students[0].marks.length == 0) this.all_students.push({id: this.group_id_counter++, first_name, last_name, group_id: this.group_id});
          // else {
            let marks = [];
            for (let i = 0; i < marks_length; i++){
              console.log(this.mark_id_counter)
              marks.push({id: this.mark_id_counter, mark: 0, user_id: this.student_id_counter, subject_id: this.subject_id, group_id: this.group_id})
              this.all_marks.push({id: this.mark_id_counter++, mark: 0, user_id: this.student_id_counter++, subject_id: this.subject_id, group_id: this.group_id})
            }
            this.all_students.push({id: this.group_id_counter, first_name, last_name, group_id: this.group_id, marks});
          // }
          this.group_id_counter++;
        }
        else this.all_students.push({id: this.student_id_counter++, first_name, last_name, group_id: this.group_id});

        event.target.value = '';
        event.target.style.width = '80px';
        this.getStudents();

      }
    },
    editGroup(event){
      console.log(event.target);
      setTimeout(()=>{
        console.log(event.target);
        this.groups.forEach(group=>{
          console.log(group.id);
          if (group.id == event.target.id) group.acronym = event.target.value;
        });
        console.log(this.groups);
      },5000);
    },
    exportExcel(){
      // let table = document.getElementById("students_table"); // you can use document.getElementById('tableId') as well by providing id to the table tag
      // TableToExcel.convert(table, { // html code may contain multiple tables so here we are refering to 1st table tag
      //   name: `export.xlsx`, // fileName you could use any name
      //   sheet: {
      //     name: 'Sheet 1' // sheetName
      //   }
      // });
      let filename='reports.xlsx';
       
      var ws = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(this.students)));
      console.log(ws);
      // var ws2 = XLSX.utils.json_to_sheet(JSON.parse(JSON.stringify(this.students.marks)));
      var wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "People");
      XLSX.writeFile(wb,filename);
    },
    importExcel() {
      if(this.students.length != 0){
      this.excelData.forEach(row =>{
        
          let marks_length = this.students[0].marks.length;
          if(this.students[0].marks.length == 0) this.all_students.push({id: this.student_id_counter++, first_name: row.Name, last_name: row.Surname, group_id: this.group_id});
          
          else {
            let marks = [];
            for (let i = 0; i < marks_length; i++){
              marks.push({id: this.mark_id_counter++, mark: 0, user_id: this.group_id_counter, subject_id: this.subject_id, group_id: this.group_id})
            }
            this.all_students.push({id: this.student_id_counter++, first_name: row.Name, last_name: row.Surname, group_id: this.group_id, marks});
          }        
          
      })
      }
      else {
        this.excelData.forEach(row =>{
        
         this.all_students.push({id: this.student_id_counter++, first_name: row.Name, last_name: row.Surname, group_id: this.group_id});
          
      })
      }
      this.getStudents();
      
      },
    loadData(event){
      var input = event.target;
      console.log(event);
      var reader = new FileReader();
      reader.onload = (e) => {
        var data = new Uint8Array(e.target.result);
        var wb = XLSX.read(data, {type: 'array'});
        wb.SheetNames.forEach((sheetName) => {
	        var rowObj = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
          console.log(rowObj);
          // console.log(XLSX.utils.sheet_to_json(wb.Sheets[sheetName]));
          // console.log(rowObj);	       
          // console.log(JSON.stringify(rowObj)); 
          this.excelData = rowObj;
          // console.log(JSON.stringify(rowObj));
// console.log(this.excelData);
        })
        // console.log(this.excelData);
      };
  
      reader.readAsArrayBuffer(input.files[0]);
      this.importExcel();
      
    },
    async getSubjects(group_id) {
      this.all_subjects.forEach(subject =>{
        if(subject.group_id == group_id) {
          this.subjects.push(subject);
        }
      })
      // this.subjects = this.all_subjects[group_id];
    },
    async addColumn(event){
      // this.students.forEach(student =>{
      //    axios.post(
      //       'http://localhost:4000/students', {
      //     query: `mutation { addColumn (user_id: ${student.id}, user_group_id: ${this.group_id}, date: "${event.target.value}", subject_id: ${this.subject_id}) {user_id, user_group_id, date} }`
      //   })
      // })
      if(event.target.value != ''){
        this.all_dates.push({id: this.date_id_counter++, mark_date: event.target.value, mark_type: '', subject_id: this.subject_id, group_id: this.group_id})
        this.all_students.forEach(st =>{
          if(st.group_id == this.group_id){
            this.all_marks.push({id: this.mark_id_counter++, mark: 0, user_id: st.id, subject_id: this.subject_id, group_id: this.group_id})
            // Vue.set(st, "marks", st.marks);
          }
          
        })
        console.log(this.all_students)
        this.getDates();  
        this.getMarks();
        this.getStudents(); 
      }
         
    },
     async updateMarkType(event){
       console.log(event.target.parentNode.parentNode.children[0].innerText);
       console.log(event.target.value);
       this.all_dates.forEach(date =>{
         if(date.id == event.target.id) date.mark_type = event.target.value;
       })
       this.getDates()
      // const res = await axios.post(
      //   'http://localhost:4000/students', {
      //   query: `mutation { updateMarkType (user_group_id: ${this.group_id}, date: "${event.target.parentNode.parentNode.children[0].innerText}", mark_type: "${event.target.value}") {user_group_id} }`
      // })
    },
    async changeGroup(event) {
      document.querySelectorAll('span.group_button').forEach(item => item.classList.remove('active'));
      event.target.classList.add('active')
      this.all_students.forEach(student =>{
          if(student.group_id == this.group_id){
            student.marks = []
          }
        })
      this.dates = []
      try {
        // const res = await axios.post(
        //   'http://localhost:4000/students', {
        //   query: `query { students_by_group (id: "${event.target.id}"){id, first_name, last_name} }`
        // })
        // this.students = res.data.data.students_by_group;
        // this.students.forEach(el =>{
        //   this.getMarks(el, el.id);
        // });
        this.group_id = event.target.id;
        this.subjects = [];
        this.getSubjects(this.group_id);
        this.getStudents();
        

      }catch (e) {
        console.log('err', e)
      }
    },
    async updateMark(event){
      console.log(event)
      console.log(event.target.id)
      this.all_marks.forEach(mark =>{
        if(mark.id == event.target.id) {
          mark.mark = event.target.value;
        }
      })
      this.getMarks()
    },
    async getStudents() {
      try {
        this.students = [];
        this.all_students.forEach(el =>{
          if (el.group_id == this.group_id) this.students.push(el);
        });
        // this.getGroups();
      } catch (e) {
        console.log(e)
      }
    },
    async getGroups() {
      try {
        const res = await axios.post(
          'http://localhost:4000/students', {
          query: 'query { groups {id, acronym} }'
        })
        this.groups = res.data.data.groups;
      } catch (e) {
        console.log(e)
      }
    },
    async getDates() {
      try {
        // const res = await axios.post(
        //   'http://localhost:4000/students', {
        //   query: `query{dates_by_group (id: "${this.group_id}", subject_id: ${this.subject_id}){ mark_date, mark_type }}`
        // })
        // console.log(res);
        this.dates = []
        this.getStudents()
        this.all_dates.forEach(date =>{
          if(date.group_id == this.group_id && date.subject_id == this.subject_id) this.dates.push(date)
        })
        this.getMarks()
        // this.dates = res.data.data.dates_by_group;
        // // Vue.set(this.dates[0], "type", "лаба")
        // console.log(this.dates);
      } catch (e) {
        console.log(e)
      }
    },
    async getMarks(el, id) {
      try {
        // this.getDates();
        // console.log(this.subject_id);
        // const res = await axios.post(
        //   'http://localhost:4000/students', {
        //   query: `query { marks_by_student_and_subject(id:${id}, subject_id: ${this.subject_id}){id, mark, user_id}}`
        // })
        // Vue.set(el, "marks", res.data.data.marks_by_student_and_subject);
        this.getStudents();
        this.all_students.forEach(student =>{
          if(student.group_id == this.group_id){
            student.marks = []
          }
        })
        
        this.students.forEach(student =>{
          this.all_marks.forEach(mark =>{
            if(student.id == mark.user_id && mark.subject_id == this.subject_id){
              student.marks.push(mark)
            }
          })
        })
        // el.marks = res.data.data.marks_by_student;
      } catch (e) {
        console.log(e)
      }
    },
    async changeSubject(event) {
      // console.log(event);
      try {
        // this.subject_id = event.target.id;
        let options = event.target.options;
        console.log(options[event.target.options.selectedIndex].id)
        this.subject_id = options[event.target.options.selectedIndex].id;
        this.getDates()
        // console.log(event.target.id);
        // console.log(id);
        // this.getDates();
        // const res = await axios.post(
        //   'http://localhost:4000/students', {
        //   query: `query { marks_by_student_and_subject(id:${id}, subject_id: ${event.target.id}){id, mark, user_id}}`
        // })
        // console.log(res);
        // Vue.set(el, "marks", res.data.data.marks_by_student);
        // el.marks = res.data.data.marks_by_student;
      } catch (e) {
        console.log(e)
      }
    }
  },
  beforeMount(){
    this.getGroups()
 }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  .date_type_input{
    width: 60px;
    background-color: inherit;
    border: none;
  }
  .date_block{
    display: flex;
    flex-direction: column;
  }
  .excel_button{
    border: none;
    background: white;
    :hover{
      -webkit-transform: translateY(-5px);
      -ms-transform: translateY(-5px);
      transform: translateY(-5px);  
    }
  }
  .red{
    background-color: red;
  }
  th {
    color: #fff;
    background-color: #706d97;
    position: relative;
  }
  td {
    min-width: 50px;
    color: #696969;
    border-bottom: 1px solid #eee;
  }
  th, td {
    padding: 10px;
    height: 20px;
    text-align: center;
  }
  td:first-child {
    width: 3vw;
    min-width: 0;
  }
  th:last-child {
    background-color: white;
    text-align: center;
  }
  td:nth-child(2) {
    width: 220px;
    min-width: 0;
    text-align: center;
  }
  tr:nth-child(odd) {
    background-color: #eee;
  }
  ul li {
    display: inline;
    /* margin-right: 5px; */
    cursor: pointer;
  }
  input[type="text"]:not(.date_type_input){
    width: 20px;
    text-align: center;
    background: inherit;
    border: none;
    cursor: pointer;
  }
  input[type="text"]:active{
    border: aqua;
  }
  .group_button {
    text-decoration: none;
    display: inline-block;
    padding: 5px 10px;
    margin: 5px;
    position: relative;
    overflow: hidden;
    border: 2px solid #706d97;
    border-radius: 8px;
    font-family: 'Montserrat', sans-serif;
    color: #706d97;
    transition: .2s ease-in-out;
  }
  .group_button:last-child {
    text-decoration: none;
    display: inline-block;
    padding: 5px 10px;
    margin: 5px;
    position: relative;
    overflow: hidden;
    border: 2px solid #706d97;
    border-radius: 8px;
    font-family: 'Montserrat', sans-serif;
    color: #706d97;
    transition: .2s ease-in-out;
    // border: none;
    // border-radius: 50%;
  }
  .group_button:before {
    content: "";
    background: linear-gradient(90deg, rgba(255, 255, 255, .1), rgba(255, 255, 255, .5));
    height: 50px;
    width: 50px;
    position: absolute;
    top: -8px;
    left: -75px;
    transform: skewX(-45deg);
  }
  .group_button:hover {
    background: #fe6637;
    color: #fff;
  }
  .active{
    background: #fe6637;
  }
  .group_button:hover:before {
    left: 150px;
    transition: .5s ease-in-out;
  }
  input.date_input { 
    border-color: rgba( 0 , 0 , 0 , 0.1 ) rgba( 0 , 0 , 0 , 0.1 ) #B3B3B3; 
    border-radius: 4px ; 
    border-style: solid ;         
    border-width: 1px ; 
    cursor: pointer;
    box-shadow :0 1px 0 rgba( 255 , 255 , 255 , 0.2 ) inset , 0 1px 2px rgba( 0 , 0 , 0 , 0.05 ); 
    color: #333333; 
    display: block ; 
    font-size: 14px ; 
    line-height : 20px ; 
    margin: 5px auto ; 
    padding: 4px 4px ; 
    text-align: center ; 
    text-shadow: 0 1px 1px rgba( 255 , 255 , 255 , 0.75 ); 
    vertical-align: middle; 
    position:relative ; -webkit-transition-duration : 0.3s ; 
    transition-duration : 0.3s; 
    -webkit-transition-property: -webkit-transform; 
    transition-property : transform; 
    -webkit-tap-highlight-color: rgba( 0 , 0 , 0 , 0 );
    -Webkit-transform: translateZ(0);
    -ms-transform: translateZ(0); 
    transform: translateZ(0); 
    box-shadow: 0 0 1px rgba( 0 , 0 , 0 , 0 ); 
  }   
  input.date_input:before { 
    pointer-events : none ; 
    position : absolute ; 
    z-index : -1 ; 
    content: '' ; 
    top: 100%; 
    left: 5%; 
    height: 10px ; 
    width : 90%; 
    opacity: 0 ; 
    background: -webkit-radial-gradient(center, ellipse, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 80%);
    background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0) 80%);
    -webkit-transition-duration: 0.3s;
    transition-duration: 0.3s;
    -webkit-transition-property: -webkit-transform, opacity;
    transition-property: transform, opacity;
  }
  input.date_input:hover {
    -webkit-transform: translateY(-5px);
    -ms-transform: translateY(-5px);
    transform: translateY(-5px);
  }
  input.date_input:hover:before {
    opacity: 1;
    -webkit-transform: translateY(5px); 
    -ms-transform: translateY(5px); 
    transform: translateY(5px); 
  }
</style>
