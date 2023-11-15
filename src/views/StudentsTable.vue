<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <Table msg="Welcome to Table"/>
  </div>
</template>

<script>
// @ is an alias to /src
import Table from '@/components/Table.vue'

export default {
  name: 'StudentsTable',
  components: {
    Table
  }
}
</script>
