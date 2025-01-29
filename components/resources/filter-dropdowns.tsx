'use client'

import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
Command,
CommandEmpty,
CommandGroup,
CommandInput,
CommandItem,
} from "@/components/ui/command"
import {
Popover,
PopoverContent,
PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Department, ResourceType, Semester } from '@/types/resources'

const departments: Department[] = [
'CSE',
'ISE',
'AIML',
'BT',
'EEE',
'ECE',
'MT',
'ME',
]

const semesters: Semester[] = [
'1st',
'2nd',
'3rd',
'4th',
'5th',
'6th',
'7th',
'8th',
]

const resourceTypes: ResourceType[] = [
'Notes',
'Textbooks',
'Practice Tests',
'Study Guides',
]

interface FilterDropdownsProps {
selectedDepartments: Department[]
setSelectedDepartments: (departments: Department[]) => void
selectedSemesters: Semester[]
setSelectedSemesters: (semesters: Semester[]) => void
selectedTypes: ResourceType[]
setSelectedTypes: (types: ResourceType[]) => void
}

export function FilterDropdowns({
selectedDepartments = [],
setSelectedDepartments,
selectedSemesters = [],
setSelectedSemesters,
selectedTypes = [],
setSelectedTypes,
}: FilterDropdownsProps) {
const toggleDepartment = (department: Department) => {
  setSelectedDepartments(
    selectedDepartments.includes(department)
      ? selectedDepartments.filter(d => d !== department)
      : [...selectedDepartments, department]
  )
}

const toggleSemester = (semester: Semester) => {
  setSelectedSemesters(
    selectedSemesters.includes(semester)
      ? selectedSemesters.filter(s => s !== semester)
      : [...selectedSemesters, semester]
  )
}

const toggleType = (type: ResourceType) => {
  setSelectedTypes(
    selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
  )
}

return (
  <div className="flex flex-wrap gap-4">
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {selectedTypes.length === 0
            ? "Select resource type"
            : `${selectedTypes.length} types selected`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search resource types..." />
          <CommandEmpty>No type found.</CommandEmpty>
          <CommandGroup>
            {resourceTypes.map((type) => (
              <CommandItem
                key={type}
                onSelect={() => toggleType(type)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedTypes.includes(type)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {type}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {selectedDepartments.length === 0
            ? "Select departments"
            : `${selectedDepartments.length} departments`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search departments..." />
          <CommandEmpty>No department found.</CommandEmpty>
          <CommandGroup>
            {departments.map((department) => (
              <CommandItem
                key={department}
                onSelect={() => toggleDepartment(department)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedDepartments.includes(department)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {department}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>

    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[200px] justify-between"
        >
          {selectedSemesters.length === 0
            ? "Select semesters"
            : `${selectedSemesters.length} semesters`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search semesters..." />
          <CommandEmpty>No semester found.</CommandEmpty>
          <CommandGroup>
            {semesters.map((semester) => (
              <CommandItem
                key={semester}
                onSelect={() => toggleSemester(semester)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedSemesters.includes(semester)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {semester}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
)
}

