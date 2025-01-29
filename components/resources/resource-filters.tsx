'use client'

import { useCallback } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Department, ResourceType, Semester } from '@/types/resources'

interface ResourceFiltersProps {
  selectedTypes: ResourceType[]
  selectedDepartments: Department[]
  selectedSemesters: Semester[]
  onTypeChange: (type: ResourceType) => void
  onDepartmentChange: (department: Department) => void
  onSemesterChange: (semester: Semester) => void
}

const resourceTypes: ResourceType[] = [
  'Notes',
  'Textbooks',
  'Practice Tests',
  'Study Guides',
]

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

export function ResourceFilters({
  selectedTypes = [],
  selectedDepartments = [],
  selectedSemesters = [],
  onTypeChange,
  onDepartmentChange,
  onSemesterChange,
}: ResourceFiltersProps) {
  // Add null checks in the callback functions
  const isTypeSelected = useCallback(
    (type: ResourceType) => (selectedTypes || []).includes(type),
    [selectedTypes]
  )

  const isDepartmentSelected = useCallback(
    (department: Department) => (selectedDepartments || []).includes(department),
    [selectedDepartments]
  )

  const isSemesterSelected = useCallback(
    (semester: Semester) => (selectedSemesters || []).includes(semester),
    [selectedSemesters]
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={selectedTypes.length === 0 ? 'secondary' : 'outline'}
          onClick={() => {
            selectedTypes.forEach((type) => onTypeChange(type))
          }}
        >
          All
        </Button>
        {resourceTypes.map((type) => (
          <Button
            key={type}
            variant={isTypeSelected(type) ? 'secondary' : 'outline'}
            onClick={() => onTypeChange(type)}
          >
            {type}
          </Button>
        ))}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            Department {selectedDepartments.length > 0 && `(${selectedDepartments.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search department..." />
            <CommandEmpty>No department found.</CommandEmpty>
            <CommandGroup>
              {departments.map((department) => (
                <CommandItem
                  key={department}
                  onSelect={() => onDepartmentChange(department)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isDepartmentSelected(department)
                        ? 'opacity-100'
                        : 'opacity-0'
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
          <Button variant="outline">
            Semester {selectedSemesters.length > 0 && `(${selectedSemesters.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search semester..." />
            <CommandEmpty>No semester found.</CommandEmpty>
            <CommandGroup>
              {semesters.map((semester) => (
                <CommandItem
                  key={semester}
                  onSelect={() => onSemesterChange(semester)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      isSemesterSelected(semester) ? 'opacity-100' : 'opacity-0'
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

